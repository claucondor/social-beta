import * as fcl from '@onflow/fcl';
import { config } from '../config';
import { FlowTransaction, BondEvolvedEvent, Bond } from '../types';
import { FLOW_CONFIG, generateImports } from '../config/contracts';

// V2 Storage Paths - Using specific paths to avoid collisions
const STORAGE_PATHS = {
  EMISARIO_STORAGE: '/storage/ClandestineEmisarioV2',
  EMISARIO_PUBLIC: '/public/ClandestineEmisarioV2',
  CLAIM_COLLECTION_STORAGE: '/storage/ClandestineClaimCollectionV2',
  CLAIM_COLLECTION_PUBLIC: '/public/ClandestineClaimCollectionV2'
};

export class FlowService {
  private initialized = false;

  constructor() {
    this.initializeFCL();
  }

  private initializeFCL() {
    if (this.initialized) return;

    fcl.config({
      'accessNode.api': config.flow.accessNode,
      'discovery.wallet': config.flow.network === 'testnet' 
        ? 'https://fcl-discovery.onflow.org/testnet/authn'
        : 'https://fcl-discovery.onflow.org/authn',
      'app.detail.title': 'La Red de Autómatas',
      'app.detail.icon': 'https://example.com/icon.png',
    });

    this.initialized = true;
  }

  /**
   * Actualiza la URI del codex y thumbnail de un Bond NFT
   */
  async updateBondMetadata(
    bondId: string, 
    codexURI: string, 
    thumbnailURI: string
  ): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        import BondContract from ${this.getBondContractAddress()}

        transaction(bondId: String, codexURI: String, thumbnailURI: String) {
          prepare(oracle: AuthAccount) {
            let bondRef = oracle.borrow<&BondContract.Bond>(from: /storage/BondCollection)
              ?? panic("Could not borrow bond reference")
            
            bondRef.updateMetadata(bondId: bondId, codexURI: codexURI, thumbnailURI: thumbnailURI)
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(bondId, t.String),
          arg(codexURI, t.String),
          arg(thumbnailURI, t.String)
        ],
        authorizations: [this.oracleAuthorization.bind(this)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.oracleAuthorization.bind(this),
        limit: 1000
      });

      const transactionId = response;

      return {
        transactionId: transactionId,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error updating bond metadata:', error);
      throw new Error(`Failed to update bond metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Otorga XP a un usuario (operación administrativa)
   */
  async grantXP(recipientAddress: string, amount: number): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        ${generateImports(['CLANDESTINE_NETWORK'])}

        transaction(recipientAddress: Address, xpAmount: UFix64) {
          prepare(admin: auth(Storage) &Account) {
            // For MVP: Admin grants XP to themselves for testing
            // In production, this would use oracle capabilities
            
            // Check if the admin is granting XP to themselves (MVP approach)
            if admin.address != recipientAddress {
              panic("For MVP: Admin must grant XP to themselves. Production version would use oracle capabilities.")
            }
            
            let emisarioRef = admin.storage.borrow<&${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.Emisario>(from: ${STORAGE_PATHS.EMISARIO_STORAGE})
              ?? panic("Emisario resource not found. Please run setup_account.cdc first")
              
            // Grant XP
            emisarioRef.xp = emisarioRef.xp + xpAmount
            
            // Check for level up
            let newLevel = emisarioRef.level
            let requiredXP = UFix64(newLevel * newLevel * 100) // Simple level formula
            
            while emisarioRef.xp >= requiredXP {
              newLevel = newLevel + 1
              emisarioRef.skillPoints = emisarioRef.skillPoints + 1
              requiredXP = UFix64(newLevel * newLevel * 100)
            }
            
            emisarioRef.level = newLevel
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(recipientAddress, t.Address),
          arg(amount.toFixed(1), t.UFix64)
        ],
        authorizations: [this.oracleAuthorization.bind(this)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.oracleAuthorization.bind(this),
        limit: 1000
      });

      return {
        transactionId: response,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error granting XP:', error);
      throw new Error(`Failed to grant XP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Registra una nueva skill (operación administrativa)
   */
  async registerSkill(skillData: {
    id: string;
    branch: string;
    maxLevel: number;
    levelRequirement: number;
    prereqID?: string;
    description: string;
  }): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        ${generateImports(['SKILL_REGISTRY'])}

        transaction(
          id: String,
          branch: String,
          maxLevel: UInt8,
          levelRequirement: UInt64,
          prereqID: String?,
          description: String
        ) {
          let adminRef: &SkillRegistry.Admin

          prepare(adminAcct: auth(Storage) &Account) {
            self.adminRef = adminAcct.storage.borrow<&SkillRegistry.Admin>(from: /storage/SkillRegistryAdmin)
              ?? panic("Could not borrow a reference to the SkillRegistry Admin resource.")
          }

          execute {
            let newData = SkillRegistry.SkillData(
              id: id,
              branch: branch,
              maxLevel: maxLevel,
              levelRequirement: levelRequirement,
              prereqID: prereqID,
              description: description
            )
            self.adminRef.registerSkill(data: newData)
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(skillData.id, t.String),
          arg(skillData.branch, t.String),
          arg(skillData.maxLevel, t.UInt8),
          arg(skillData.levelRequirement.toString(), t.UInt64),
          arg(skillData.prereqID || null, t.Optional(t.String)),
          arg(skillData.description, t.String)
        ],
        authorizations: [this.oracleAuthorization.bind(this)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.oracleAuthorization.bind(this),
        limit: 1000
      });

      return {
        transactionId: response,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error registering skill:', error);
      throw new Error(`Failed to register skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene información de un Bond
   */
  async getBond(bondId: string): Promise<Bond | null> {
    try {
      const scriptCode = `
        import BondContract from ${this.getBondContractAddress()}

        pub fun main(bondId: String): Bond? {
          return BondContract.getBond(bondId: bondId)
        }
      `;

      const result = await fcl.query({
        cadence: scriptCode,
        args: (arg: any, t: any) => [arg(bondId, t.String)]
      });

      return result ? this.formatBondData(result) : null;
    } catch (error) {
      console.error('Error fetching bond:', error);
      return null;
    }
  }

  /**
   * Escucha eventos BondEvolved
   */
  async subscribeToBondEvolvedEvents(callback: (event: BondEvolvedEvent) => void): Promise<void> {
    try {
      fcl.events(`${this.getBondContractAddress()}.BondEvolved`).subscribe((event: any) => {
        callback(event as BondEvolvedEvent);
      });
    } catch (error) {
      console.error('Error subscribing to bond evolved events:', error);
      throw new Error(`Failed to subscribe to events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica el estado de una transacción
   */
  async getTransactionStatus(transactionId: string): Promise<FlowTransaction> {
    try {
      const result = await fcl.tx(transactionId).onceSealed();
      
      return {
        transactionId,
        status: result.status === 4 ? 'sealed' : 'pending',
        errorMessage: result.errorMessage
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return {
        transactionId,
        status: 'unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Autorización del oráculo para firmar transacciones
   */
  private async oracleAuthorization(account: any) {
    return {
      ...account,
      addr: config.flow.oracleAddress,
      keyId: 0,
      signingFunction: async (signable: any) => {
        // En un entorno real, aquí usarías la clave privada para firmar
        // Por ahora, simulamos la firma
        return {
          signature: 'mock_signature',
          keyId: 0,
          addr: config.flow.oracleAddress
        };
      }
    };
  }

  /**
   * Obtiene la dirección del contrato de Bonds según la red
   */
  private getBondContractAddress(): string {
    return config.flow.network === 'testnet' 
      ? '0x01234567890abcdef' // Dirección en testnet
      : '0xfedcba0987654321'; // Dirección en mainnet
  }

  /**
   * Obtiene la dirección del contrato de usuarios según la red
   */
  private getUserContractAddress(): string {
    return config.flow.network === 'testnet'
      ? '0x11234567890abcdef' // Dirección en testnet
      : '0xeedcba0987654321'; // Dirección en mainnet
  }

  /**
   * Formatea los datos del Bond desde Flow
   */
  private formatBondData(rawData: any): Bond {
    return {
      id: rawData.id,
      tokenId: rawData.tokenId,
      ownerAddress: rawData.owner,
      recipientAddress: rawData.recipient,
      level: parseInt(rawData.level),
      artSeed: rawData.artSeed || [],
      codexURI: rawData.codexURI,
      thumbnail: rawData.thumbnail,
      lastEvolution: rawData.lastEvolution ? parseInt(rawData.lastEvolution) : undefined
    };
  }

  /**
   * Crea un Emisario para un usuario
   */
  async createEmisario(userAddress: string): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        ${generateImports(['CLANDESTINE_NETWORK', 'NON_FUNGIBLE_TOKEN'])}

        transaction(userAddress: Address) {
          prepare(admin: auth(Storage) &Account) {
            // For MVP: Admin creates an Emisario for the user
            // In production, users would create their own Emisario
            
            // Create new Emisario V2
            let newEmisario <- ${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.createEmisario()
            
            // Get the target user's account
            let userAccount = getAccount(userAddress)
            
            // Store it in the user's account using V2 path
            userAccount.storage.save(<-newEmisario, to: ${STORAGE_PATHS.EMISARIO_STORAGE})
            
            // Create a public capability for the Emisario
            let emisarioPublicCap = userAccount.capabilities.storage.issue<&{${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.EmisarioPublic}>(${STORAGE_PATHS.EMISARIO_STORAGE})
            userAccount.capabilities.publish(emisarioPublicCap, at: ${STORAGE_PATHS.EMISARIO_PUBLIC})
            
            // Create ClaimTicket collection if it doesn't exist
            if userAccount.storage.borrow<&${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.Collection>(from: ${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE}) == nil {
              let collection <- ${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.createEmptyCollection()
              userAccount.storage.save(<-collection, to: ${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE})
              
              // Create a public capability for the collection
              let collectionCap = userAccount.capabilities.storage.issue<&{NonFungibleToken.Collection}>(${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE})
              userAccount.capabilities.publish(collectionCap, at: ${STORAGE_PATHS.CLAIM_COLLECTION_PUBLIC})
            }
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(userAddress, t.Address)
        ],
        authorizations: [this.oracleAuthorization.bind(this)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.oracleAuthorization.bind(this),
        limit: 1000
      });

      return {
        transactionId: response,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error creating Emisario:', error);
      throw new Error(`Failed to create Emisario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Establece la clave pública de un usuario
   */
  async setPublicKey(userAddress: string, publicKey: string): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        ${generateImports(['CLANDESTINE_NETWORK'])}

        transaction(userAddress: Address, newPublicKey: String) {
          prepare(admin: auth(Storage) &Account) {
            // For MVP: Admin sets the public key for the user
            // In production, users would set their own public key
            
            let userAccount = getAccount(userAddress)
            let emisarioRef = userAccount.storage.borrow<&${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.Emisario>(from: ${STORAGE_PATHS.EMISARIO_STORAGE})
              ?? panic("Emisario resource not found. Please create Emisario first")
              
            emisarioRef.setPublicKey(newKey: newPublicKey)
            log("Public encryption key has been set/updated successfully.")
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(userAddress, t.Address),
          arg(publicKey, t.String)
        ],
        authorizations: [this.oracleAuthorization.bind(this)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.oracleAuthorization.bind(this),
        limit: 1000
      });

      return {
        transactionId: response,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error setting public key:', error);
      throw new Error(`Failed to set public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Crea un vínculo entre dos usuarios
   */
  async forgeBond(initiatorAddress: string, partnerAddress: string): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        ${generateImports(['CLANDESTINE_NETWORK', 'NON_FUNGIBLE_TOKEN'])}

        transaction(initiatorAddress: Address, partnerAddress: Address) {
          prepare(admin: auth(Storage) &Account) {
            // For MVP: Admin creates a bond between two users
            // In production, the initiator would create the bond
            
            let initiatorAccount = getAccount(initiatorAddress)
            let partnerAccount = getAccount(partnerAddress)
            
            // Get references to both users' collections
            let initiatorCollection = initiatorAccount.storage.borrow<&${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.Collection>(from: ${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE})
              ?? panic("Initiator does not have a ClaimTicket collection.")
              
            let partnerCollection = partnerAccount.storage.borrow<&${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.Collection>(from: ${STORAGE_PATHS.CLAIM_COLLECTION_STORAGE})
              ?? panic("Partner does not have a ClaimTicket collection.")
              
            // Get the initiator's Emisario
            let initiatorEmisario = initiatorAccount.storage.borrow<&${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.Emisario>(from: ${STORAGE_PATHS.EMISARIO_STORAGE})
              ?? panic("Initiator does not have an Emisario resource.")
              
            // Create the bond
            let tickets <- ${FLOW_CONFIG.CONTRACTS.CLANDESTINE_NETWORK}.forgeBondSimple(
              emisario1: initiatorEmisario,
              owner1: initiatorAddress,
              owner2: partnerAddress
            )
            
            // Distribute tickets
            partnerCollection.deposit(token: <- tickets.removeFirst())
            initiatorCollection.deposit(token: <- tickets.removeFirst())
            
            destroy tickets
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(initiatorAddress, t.Address),
          arg(partnerAddress, t.Address)
        ],
        authorizations: [this.oracleAuthorization.bind(this)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.oracleAuthorization.bind(this),
        limit: 1000
      });

      return {
        transactionId: response,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error forging bond:', error);
      throw new Error(`Failed to forge bond: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getClandestineNetworkAddress(): string {
    return FLOW_CONFIG.ADDRESSES.TESTNET.DEPLOYER;
  }
}