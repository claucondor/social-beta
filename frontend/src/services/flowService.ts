import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

// Configurar FCL con las direcciones de los contratos
fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'La Red de Autómatas',
  'app.detail.icon': 'https://placekitten.com/g/200/200',
  'env': 'testnet',
  // Configurar las direcciones de los contratos
  '0xClandestineNetwork': '0x2444e6b4d9327f09',
  '0xSkillRegistry': '0x2444e6b4d9327f09',
  '0xGifts': '0x2444e6b4d9327f09',
  '0xNonFungibleToken': '0x631e88ae7f1d7c20',
  '0xMetadataViews': '0x631e88ae7f1d7c20',
  '0xViewResolver': '0x631e88ae7f1d7c20',
  '0xFungibleToken': '0x9a0766d93b6608b7',
  '0xFlowToken': '0x7e60df042a9c0868'
});

// Códigos de las transacciones de Cadence
const SETUP_ACCOUNT_TRANSACTION = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import ClandestineNetwork from 0x2444e6b4d9327f09

transaction {

    prepare(signer: auth(Storage, Capabilities) &Account) {

        // 1. Set up the Emisario resource if it doesn't exist
        if signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath) == nil {
            let emisario <- ClandestineNetwork.createEmisario()
            signer.storage.save(<-emisario, to: ClandestineNetwork.EmisarioStoragePath)
            
            log("Emisario resource created and saved.")
        } else {
            log("Emisario resource already exists.")
        }

        // 2. Set up the ClaimTicket NFT Collection if it doesn't exist
        if signer.storage.borrow<&ClandestineNetwork.Collection>(from: ClandestineNetwork.ClaimCollectionStoragePath) == nil {
            let collection <- ClandestineNetwork.createEmptyCollection()
            signer.storage.save(<-collection, to: ClandestineNetwork.ClaimCollectionStoragePath)

            // Create a public capability for the collection.
            let cap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionStoragePath)
            signer.capabilities.publish(cap, at: ClandestineNetwork.ClaimCollectionPublicPath)
            
            log("ClaimTicket NFT Collection created and capability published.")
        } else {
            log("ClaimTicket NFT Collection already exists.")
        }
    }

    execute {
        log("Account setup for the Clandestine Network is complete.")
    }
}
`;

const SET_PUBLIC_KEY_TRANSACTION = `
import ClandestineNetwork from 0x2444e6b4d9327f09

transaction(newPublicKey: String) {

    let emisarioRef: &ClandestineNetwork.Emisario

    prepare(signer: auth(Storage) &Account) {
        self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Emisario resource not found. Please run setup_account.cdc")
    }

    execute {
        self.emisarioRef.setPublicKey(newKey: newPublicKey)
        log("Public encryption key has been set/updated successfully.")
    }
}
`;

const GET_USER_STATUS_SCRIPT = `
import ClandestineNetwork from 0x2444e6b4d9327f09
import NonFungibleToken from 0x631e88ae7f1d7c20

access(all) fun main(userAddress: Address): {String: AnyStruct} {
    let account = getAccount(userAddress)
    
    // Check public capabilities instead of private storage
    var hasEmisario = false
    var emisarioData: {String: AnyStruct} = {}
    
    // Try to get public capability for Emisario (if it exists)
    // For now, we'll return basic info - in production you'd need public capabilities
    
    // Check if user has Collection via public capability
    var hasCollection = false
    var collectionData: {String: AnyStruct} = {}
    
    if let collectionRef = account.capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath).borrow() {
        hasCollection = true
        collectionData = {
            "length": collectionRef.getLength(),
            "ids": collectionRef.getIDs()
        }
    }
    
    // Check public capabilities
    var hasPublicCollection = false
    let publicCollectionCap = account.capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath)
    if publicCollectionCap.check() {
        hasPublicCollection = true
    }
    
    // For MVP, we'll consider user setup if they have public collection
    // In production, you'd need to add public capabilities for Emisario data
    let isSetup = hasPublicCollection
    
    return {
        "address": userAddress.toString(),
        "hasEmisario": isSetup,
        "hasCollection": hasCollection,
        "hasPublicCollection": hasPublicCollection,
        "emisarioData": emisarioData,
        "collectionData": collectionData,
        "isFullySetup": isSetup
    }
}
`;

export class FlowService {
  
  /**
   * Configura la cuenta del usuario creando Emisario y Collection
   */
  static async setupAccount(): Promise<string> {
    try {
      console.log('🔄 Starting account setup...');
      
      // Verificar autenticación
      const currentUser = await fcl.currentUser.snapshot();
      if (!currentUser.loggedIn) {
        throw new Error('User not authenticated');
      }
      
      console.log('✅ User authenticated:', currentUser.addr);
      console.log('📝 Sending setup account transaction...');
      
      const transactionId = await fcl.mutate({
        cadence: SETUP_ACCOUNT_TRANSACTION,
        args: () => [],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      });
      
      console.log('✅ Setup account transaction sent:', transactionId);
      
      // Wait for transaction to be sealed
      const result = await fcl.tx(transactionId).onceSealed();
      console.log('✅ Setup account transaction sealed:', result);
      
      return transactionId;
    } catch (error) {
      console.error('❌ Error setting up account:', error);
      throw error;
    }
  }

  /**
   * Establece la clave pública de encriptación del usuario
   */
  static async setPublicKey(publicKey: string): Promise<string> {
    try {
      console.log('🔄 Starting public key setup...');
      
      // Verificar autenticación
      const currentUser = await fcl.currentUser.snapshot();
      if (!currentUser.loggedIn) {
        throw new Error('User not authenticated');
      }
      
      console.log('✅ User authenticated:', currentUser.addr);
      console.log('📝 Sending set public key transaction...');
      
      const transactionId = await fcl.mutate({
        cadence: SET_PUBLIC_KEY_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(publicKey, t.String)
        ],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      });
      
      console.log('✅ Set public key transaction sent:', transactionId);
      
      // Wait for transaction to be sealed
      const result = await fcl.tx(transactionId).onceSealed();
      console.log('✅ Set public key transaction sealed:', result);
      
      return transactionId;
    } catch (error) {
      console.error('❌ Error setting public key:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado completo del usuario
   */
  static async getUserStatus(address: string): Promise<any> {
    try {
      console.log('🔄 Checking user status for:', address);
      
      const result = await fcl.query({
        cadence: GET_USER_STATUS_SCRIPT,
        args: (arg: any, t: any) => [
          arg(address, t.Address)
        ]
      });
      
      console.log('✅ User status result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting user status:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene un Emisario configurado (compatibilidad hacia atrás)
   */
  static async getEmisarioData(address: string): Promise<any> {
    const status = await this.getUserStatus(address);
    if (status && status.hasEmisario) {
      return {
        ...status.emisarioData,
        exists: true
      };
    }
    return null;
  }

  /**
   * Verifica si el usuario está completamente configurado
   */
  static async isUserSetup(address: string): Promise<boolean> {
    const status = await this.getUserStatus(address);
    return status && status.isFullySetup === true;
  }

  /**
   * Proceso completo de registro: setup account + set public key
   */
  static async registerUser(displayName?: string): Promise<boolean> {
    try {
      console.log('🚀 Starting user registration process...');
      
      // 1. Setup account (crear Emisario y Collection)
      console.log('📝 Step 1: Setting up account...');
      await this.setupAccount();
      
      // 2. Set public key (usar displayName como clave por ahora, en producción sería una clave real)
      console.log('📝 Step 2: Setting public key...');
      const publicKey = displayName ? `${displayName}_${Date.now()}` : `user_${Date.now()}`;
      await this.setPublicKey(publicKey);
      
      console.log('🎉 User registration completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error during user registration:', error);
      return false;
    }
  }
} 