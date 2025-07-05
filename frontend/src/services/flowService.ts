import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { FLOW_CONFIG, generateImports } from '../config/contracts';

// Configurar FCL con las direcciones de los contratos
fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/api/testnet/authn',
  'app.detail.title': 'La Red de Autómatas',
  'app.detail.icon': 'https://placekitten.com/g/200/200',
  'env': 'testnet',
  '0xClandestineNetworkV2': FLOW_CONFIG.ADDRESSES.TESTNET.DEPLOYER,
  '0xSkillRegistry': FLOW_CONFIG.ADDRESSES.TESTNET.DEPLOYER,
  '0xGifts': FLOW_CONFIG.ADDRESSES.TESTNET.DEPLOYER,
  '0xNonFungibleToken': FLOW_CONFIG.ADDRESSES.TESTNET.NON_FUNGIBLE_TOKEN,
  '0xMetadataViews': FLOW_CONFIG.ADDRESSES.TESTNET.METADATA_VIEWS,
  '0xViewResolver': FLOW_CONFIG.ADDRESSES.TESTNET.VIEW_RESOLVER,
  '0xFungibleToken': FLOW_CONFIG.ADDRESSES.TESTNET.FUNGIBLE_TOKEN,
  '0xFlowToken': FLOW_CONFIG.ADDRESSES.TESTNET.FLOW_TOKEN
});

const contractName = FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK;
const contractAddress = FLOW_CONFIG.ADDRESSES.TESTNET.DEPLOYER;

// V2 Storage Paths - Using specific paths to avoid collisions
const STORAGE_PATHS = {
  EMISARIO_STORAGE: '/storage/ClandestineEmisarioV2',
  EMISARIO_PUBLIC: '/public/ClandestineEmisarioV2',
  CLAIM_COLLECTION_STORAGE: '/storage/ClandestineClaimCollectionV2',
  CLAIM_COLLECTION_PUBLIC: '/public/ClandestineClaimCollectionV2'
};

// Códigos de las transacciones de Cadence
const SETUP_ACCOUNT_TRANSACTION = `
${generateImports(['CLANDESTINE_NETWORK', 'NON_FUNGIBLE_TOKEN'])}

transaction {
  prepare(signer: auth(Storage, Capabilities) &Account) {
    // Use specific paths for V2 to avoid collisions
    let emisarioStoragePath = ${STORAGE_PATHS.EMISARIO_STORAGE}
    let emisarioPublicPath = ${STORAGE_PATHS.EMISARIO_PUBLIC}
    let claimCollectionStoragePath = ${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE}
    let claimCollectionPublicPath = ${STORAGE_PATHS.CLAIM_COLLECTION_PUBLIC}
    
    // Create new Emisario V2
    let newEmisario <- ${contractName}.createEmisario()
    
    // Store it in the account using V2 path
    signer.storage.save(<-newEmisario, to: emisarioStoragePath)
    
    // Create a public capability for the Emisario
    let emisarioPublicCap = signer.capabilities.storage.issue<&{${contractName}.EmisarioPublic}>(emisarioStoragePath)
    signer.capabilities.publish(emisarioPublicCap, at: emisarioPublicPath)
    
    // Create ClaimTicket collection if it doesn't exist
    if signer.storage.borrow<&${contractName}.Collection>(from: claimCollectionStoragePath) == nil {
      let collection <- ${contractName}.createEmptyCollection()
      signer.storage.save(<-collection, to: claimCollectionStoragePath)
      
      // Create a public capability for the collection
      let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(claimCollectionStoragePath)
      signer.capabilities.publish(collectionCap, at: claimCollectionPublicPath)
    }
  }

  execute {
    log("Account setup completed successfully")
  }
}
`;

const SET_PUBLIC_KEY_TRANSACTION = `
${generateImports(['CLANDESTINE_NETWORK'])}

transaction(newPublicKey: String) {
  let emisarioRef: &${contractName}.Emisario

  prepare(signer: auth(Storage) &Account) {
    self.emisarioRef = signer.storage.borrow<&${contractName}.Emisario>(from: ${STORAGE_PATHS.EMISARIO_STORAGE})
      ?? panic("Emisario resource not found. Please run setup_account.cdc first")
  }

  execute {
    self.emisarioRef.setPublicKey(newKey: newPublicKey)
    log("Public encryption key has been set/updated successfully.")
  }
}
`;

const GET_USER_STATUS_SCRIPT = `
${generateImports(['CLANDESTINE_NETWORK', 'NON_FUNGIBLE_TOKEN'])}

access(all) fun main(userAddress: Address): {String: AnyStruct} {
    let account = getAccount(userAddress)
    
    // Check if user has Emisario V2
    var hasEmisario = false
    var emisarioData: {String: AnyStruct} = {}
    
    // Try to get V2 Emisario first
    if let emisarioRef = account.capabilities.get<&{${contractName}.EmisarioPublic}>(${STORAGE_PATHS.EMISARIO_PUBLIC}).borrow() {
        hasEmisario = true
        emisarioData = {
            "encryptionPubKey": emisarioRef.encryptionPubKey,
            "hasPublicKey": emisarioRef.encryptionPubKey.length > 0,
            "level": emisarioRef.level,
            "id": emisarioRef.id
        }
    }
    
    // Check if user has Collection V2 via public capability
    var hasCollection = false
    var collectionData: {String: AnyStruct} = {}
    
    if let collectionRef = account.capabilities.get<&{NonFungibleToken.Collection}>(${STORAGE_PATHS.CLAIM_COLLECTION_PUBLIC}).borrow() {
        hasCollection = true
        collectionData = {
            "length": collectionRef.getLength(),
            "ids": collectionRef.getIDs()
        }
    }
    
    // Check public capabilities
    var hasPublicCollection = false
    let publicCollectionCap = account.capabilities.get<&{NonFungibleToken.Collection}>(${STORAGE_PATHS.CLAIM_COLLECTION_PUBLIC})
    if publicCollectionCap.check() {
        hasPublicCollection = true
    }
    
    // User is fully setup if they have both Emisario and Collection
    let isSetup = hasEmisario && hasPublicCollection
    
    return {
        "address": userAddress.toString(),
        "hasEmisario": hasEmisario,
        "hasCollection": hasCollection,
        "hasPublicCollection": hasPublicCollection,
        "emisarioData": emisarioData,
        "collectionData": collectionData,
        "isFullySetup": isSetup,
        "version": "V2"
    }
}
`;

const GET_PUBLIC_KEY_SCRIPT = `
${generateImports(['CLANDESTINE_NETWORK'])}

access(all) fun main(userAddress: Address): String? {
    let account = getAccount(userAddress)
    
    // Try V2 first 
    if let emisarioRef = account.capabilities.get<&{${contractName}.EmisarioPublic}>(${STORAGE_PATHS.EMISARIO_PUBLIC}).borrow() {
        return emisarioRef.encryptionPubKey.length > 0 ? emisarioRef.encryptionPubKey : nil
    }
    
    return nil
}
`;

const FORGE_BOND_TRANSACTION = `
${generateImports(['CLANDESTINE_NETWORK', 'NON_FUNGIBLE_TOKEN'])}

transaction(partnerAddress: Address) {
  let initiatorCollectionRef: &${contractName}.Collection
  let initiatorEmisarioRef: &${contractName}.Emisario

  prepare(signer: auth(Storage) &Account) {
    self.initiatorCollectionRef = signer.storage.borrow<&${contractName}.Collection>(from: ${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE})
      ?? panic("Initiator does not have a ClaimTicket collection.")

    self.initiatorEmisarioRef = signer.storage.borrow<&${contractName}.Emisario>(from: ${STORAGE_PATHS.EMISARIO_STORAGE})
      ?? panic("Initiator does not have an Emisario resource.")
  }

  execute {
    let tickets <- ${contractName}.forgeBondSimple(
      emisario1: self.initiatorEmisarioRef,
      owner1: self.initiatorCollectionRef.owner!.address,
      owner2: partnerAddress
    )

    let partnerAccount = getAccount(partnerAddress)
    let partnerCollection = partnerAccount.capabilities.get<&{NonFungibleToken.Collection}>(${STORAGE_PATHS.CLAIM_COLLECTION_PUBLIC}).borrow()
      ?? panic("Could not borrow partner's collection.")
    partnerCollection.deposit(token: <- tickets.removeFirst())

    self.initiatorCollectionRef.deposit(token: <- tickets.removeFirst())

    destroy tickets
  }
}
`;

const UNLOCK_SKILL_TRANSACTION = `
${generateImports(['CLANDESTINE_NETWORK', 'SKILL_REGISTRY'])}

transaction(skillID: String) {
  let emisarioRef: &${contractName}.Emisario
  let skillData: SkillRegistry.SkillData

  prepare(signer: auth(Storage) &Account) {
    self.emisarioRef = signer.storage.borrow<&${contractName}.Emisario>(from: ${STORAGE_PATHS.EMISARIO_STORAGE})
      ?? panic("Emisario resource not found. Please run setup_account.cdc")

    self.skillData = SkillRegistry.getSkillData(skillID: skillID)
      ?? panic("Skill with the specified ID is not registered.")
  }

  execute {
    // Check if the user has skill points to spend
    if self.emisarioRef.skillPoints < 1 {
      panic("Not enough skill points. Current: 0")
    }

    // Check if the user meets the level requirement
    if self.emisarioRef.level < self.skillData.levelRequirement {
      panic("Level requirement not met. Required: ".concat(self.skillData.levelRequirement.toString()).concat(", Current: ").concat(self.emisarioRef.level.toString()))
    }
    
    // Check for prerequisites
    let currentSkillLevel = self.emisarioRef.skills[self.skillData.id] ?? 0

    if let prereqID = self.skillData.prereqID {
      if (self.emisarioRef.skills[prereqID] ?? 0) == 0 {
        panic("Prerequisite skill '".concat(prereqID).concat("' not unlocked."))
      }
    }

    // Check if the skill is already at max level
    if currentSkillLevel >= self.skillData.maxLevel {
      panic("Skill is already at max level.")
    }

    // Spend the skill point
    self.emisarioRef.skillPoints = self.emisarioRef.skillPoints - 1

    // Increase the skill level
    self.emisarioRef.skills[self.skillData.id] = currentSkillLevel + 1
  }
}
`;

const GET_USER_BONDS_SCRIPT = `
${generateImports(['CLANDESTINE_NETWORK', 'NON_FUNGIBLE_TOKEN'])}

access(all) fun main(userAddress: Address): [{String: AnyStruct}] {
    let result: [{String: AnyStruct}] = []
    let account = getAccount(userAddress)
    
    if let collectionRef = account.capabilities.get<&{NonFungibleToken.Collection}>(${STORAGE_PATHS.CLAIM_COLLECTION_PUBLIC}).borrow() {
        let claimTicketIDs = collectionRef.getIDs()

        // Iterate through each ClaimTicket ID in the user's collection.
        for id in claimTicketIDs {
            // Borrow the NFT to get its details, specifically the bondID.
            let claimTicket = collectionRef.borrowNFT(id: id) as! &${contractName}.ClaimTicket

            // Use the bondID from the ticket to fetch the actual Vinculo details.
            let bondDetails = ${contractName}.borrowVinculo(id: claimTicket.bondID)

            if let bond = bondDetails {
                let bondInfo = {
                    "bondID": bond.id,
                    "owners": bond.owners,
                    "emisarioIDs": bond.emisarioIDs,
                    "messagesExchanged": bond.messagesExchanged,
                    "bondLevel": bond.bondLevel,
                    "bondPoints": bond.bondPoints,
                    "status": bond.status,
                    "artSeed": bond.artSeed,
                    "colorPaletteSeed": bond.colorPaletteSeed,
                    "patternComplexitySeed": bond.patternComplexitySeed,
                    "codexURI": bond.codexURI
                }
                result.append(bondInfo)
            }
        }
    }

    return result
}
`;

// FlowService class with V2 support
class FlowService {
  async executeTransaction(code: string, args: any[] = []): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: code,
        args: (arg: any, t: any) => args.map(value => {
          if (typeof value === 'string') return arg(value, t.String);
          if (typeof value === 'number') return arg(value, t.UInt64);
          return arg(value, t.String);
        }),
        proposer: fcl.proposer,
        payer: fcl.payer,
        authorizations: [fcl.authz],
        limit: 9999
      });

      console.log('Transaction sent:', transactionId);
      const transaction = await fcl.tx(transactionId).onceSealed();
      console.log('Transaction sealed:', transaction);
      
      return transactionId;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  async executeScript(code: string, args: any[] = []): Promise<any> {
    try {
      const result = await fcl.query({
        cadence: code,
        args: (arg: any, t: any) => args.map(value => {
          if (typeof value === 'string') return arg(value, t.Address);
          return arg(value, t.String);
        })
      });
      
      return result;
    } catch (error) {
      console.error('Script execution failed:', error);
      throw error;
    }
  }

  // V2 Transaction Methods
  async setupAccount(): Promise<string> {
    return this.executeTransaction(SETUP_ACCOUNT_TRANSACTION);
  }

  async setPublicKey(publicKey: string): Promise<string> {
    return this.executeTransaction(SET_PUBLIC_KEY_TRANSACTION, [publicKey]);
  }

  async forgeBond(partnerAddress: string): Promise<string> {
    return this.executeTransaction(FORGE_BOND_TRANSACTION, [partnerAddress]);
  }

  async unlockSkill(skillID: string): Promise<string> {
    return this.executeTransaction(UNLOCK_SKILL_TRANSACTION, [skillID]);
  }

  // V2 Script Methods  
  async getUserStatus(address: string): Promise<any> {
    return this.executeScript(GET_USER_STATUS_SCRIPT, [address]);
  }

  async getUserPublicKey(address: string): Promise<string | null> {
    return this.executeScript(GET_PUBLIC_KEY_SCRIPT, [address]);
  }

  async getUserBonds(address: string): Promise<any[]> {
    return this.executeScript(GET_USER_BONDS_SCRIPT, [address]);
  }

  // 🔥 NUEVO: Método completo de registro de usuario
  async registerUser(displayName?: string, country?: string): Promise<boolean> {
    try {
      const currentUser = await fcl.currentUser.snapshot();
      if (!currentUser.loggedIn || !currentUser.addr) {
        throw new Error('User not authenticated');
      }

      const address = currentUser.addr;
      console.log('🚀 Iniciando registro completo para:', address);

      // 1. Generar par de claves para el usuario
      console.log('🔐 Generando claves criptográficas...');
      const { CryptoService } = await import('./cryptoService');
      const keyPair = await CryptoService.setupKeysForAddress(address);
      
      // 2. Crear Emisario en blockchain
      console.log('⛓️  Creando Emisario en blockchain...');
      await this.setupAccount();
      
      // 3. Guardar clave pública en blockchain
      console.log('📢 Guardando clave pública en blockchain...');
      await this.setPublicKey(keyPair.publicKeyPem);
      
      // 4. Guardar datos del usuario en backend
      if (displayName || country) {
        console.log('💾 Guardando datos en backend...');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${API_BASE_URL}/api/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            displayName,
            country,
            publicKey: keyPair.publicKeyPem
          })
        });

        const result = await response.json();
        if (!result.success) {
          console.warn('⚠️  Backend registration failed, but blockchain registration succeeded');
        }
      }

      console.log('✅ Registro completo exitoso!');
      return true;
    } catch (error) {
      console.error('❌ Error en registro completo:', error);
      return false;
    }
  }

  // 🔥 NUEVO: Obtener datos del Emisario
  async getEmisarioData(address: string): Promise<any> {
    try {
      const userStatus = await this.getUserStatus(address);
      
      if (userStatus.isFullySetup && userStatus.hasEmisario) {
        return {
          exists: true,
          id: userStatus.emisarioData.id,
          level: userStatus.emisarioData.level || 1,
          xp: 0, // TODO: Implementar XP en contrato
          skillPoints: 0, // TODO: Implementar skill points
          encryptionPubKey: userStatus.emisarioData.encryptionPubKey
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error getting Emisario data:', error);
      return { exists: false };
    }
  }

  // 🔥 NUEVO: Obtener clave pública (alias para compatibilidad)
  async getPublicKey(address: string): Promise<string | null> {
    return this.getUserPublicKey(address);
  }

  // Transaction code getters for backend integration
  getSetupAccountTransaction(): string {
    return SETUP_ACCOUNT_TRANSACTION;
  }

  getSetPublicKeyTransaction(): string {
    return SET_PUBLIC_KEY_TRANSACTION;
  }

  getForgeBondTransaction(): string {
    return FORGE_BOND_TRANSACTION;
  }

  getUnlockSkillTransaction(): string {
    return UNLOCK_SKILL_TRANSACTION;
  }

  // Storage paths for reference
  getStoragePaths() {
    return STORAGE_PATHS;
  }
}

// 🔥 NUEVO: Exportar instancia singleton
const flowService = new FlowService();

export { flowService as FlowService, STORAGE_PATHS }; 