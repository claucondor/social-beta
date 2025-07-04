import * as fcl from '@onflow/fcl';
import { config } from '../config';
import { FlowTransaction, BondEvolvedEvent, Bond } from '../types';

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
   * Otorga XP a un usuario
   */
  async grantXP(userAddress: string, amount: number): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        import UserContract from ${this.getUserContractAddress()}

        transaction(userAddress: Address, amount: UInt64) {
          prepare(oracle: AuthAccount) {
            UserContract.grantXP(userAddress: userAddress, amount: amount)
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [
          arg(userAddress, t.Address),
          arg(amount.toString(), t.UInt64)
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
      console.error('Error granting XP:', error);
      throw new Error(`Failed to grant XP: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Crea un nuevo Emisario en la blockchain
   */
  async createEmisario(userAddress: string): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        import ClandestineNetwork from ${this.getClandestineNetworkAddress()}

        transaction {
          prepare(signer: auth(Storage, Capabilities) &Account) {
            // Check if account already has an Emisario
            if signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath) != nil {
              panic("Account already has an Emisario")
            }

            // Create new Emisario
            let newEmisario <- ClandestineNetwork.createEmisario()
            
            // Store it in the account
            signer.storage.save(<-newEmisario, to: ClandestineNetwork.EmisarioStoragePath)
            
            // Create ClaimTicket collection if it doesn't exist
            if signer.storage.borrow<&ClandestineNetwork.Collection>(from: ClandestineNetwork.ClaimCollectionStoragePath) == nil {
              let collection <- ClandestineNetwork.createEmptyCollection()
              signer.storage.save(<-collection, to: ClandestineNetwork.ClaimCollectionStoragePath)
              
              // Create a public capability for the collection
              let cap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionStoragePath)
              signer.capabilities.publish(cap, at: ClandestineNetwork.ClaimCollectionPublicPath)
            }
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: () => [],
        authorizations: [this.createAuthorizationFunction(userAddress)],
        payer: this.oracleAuthorization.bind(this),
        proposer: this.createAuthorizationFunction(userAddress),
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
   * Configura la clave pública de cifrado de un usuario
   */
  async setPublicKey(userAddress: string, publicKey: string): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        import ClandestineNetwork from ${this.getClandestineNetworkAddress()}

        transaction(newPublicKey: String) {
          let emisarioRef: &ClandestineNetwork.Emisario

          prepare(signer: auth(Storage) &Account) {
            self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
              ?? panic("Emisario resource not found. Please run setup_account.cdc first")
          }

          execute {
            self.emisarioRef.setPublicKey(newKey: newPublicKey)
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [arg(publicKey, t.String)],
        authorizations: [this.createAuthorizationFunction(userAddress)],
        payer: this.createAuthorizationFunction(userAddress),
        proposer: this.createAuthorizationFunction(userAddress),
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
   * Crea un bond entre dos usuarios
   */
  async forgeBond(initiatorAddress: string, partnerAddress: string): Promise<FlowTransaction> {
    try {
      const transactionCode = `
        import ClandestineNetwork from ${this.getClandestineNetworkAddress()}
        import NonFungibleToken from 0x1d7e57aa55817448

        transaction(partnerAddress: Address) {
          let initiatorEmisarioRef: &ClandestineNetwork.Emisario
          let initiatorCollectionRef: &{NonFungibleToken.Collection}
          let partnerCollectionCap: Capability<&{NonFungibleToken.Collection}>

          prepare(initiator: auth(Storage, Capabilities) &Account) {
            self.initiatorEmisarioRef = initiator.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
              ?? panic("Initiator's Emisario resource not found. Please run setup_account.cdc")

            self.initiatorCollectionRef = initiator.storage.borrow<&{NonFungibleToken.Collection}>(from: ClandestineNetwork.ClaimCollectionStoragePath)
              ?? panic("Initiator's ClaimTicket Collection not found. Please run setup_account.cdc")

            self.partnerCollectionCap = getAccount(partnerAddress).capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath)
            
            if !self.partnerCollectionCap.check() {
              panic("Partner's ClaimTicket Collection capability is not valid or has not been published.")
            }
          }

          execute {
            let tickets <- ClandestineNetwork.forgeBondSimple(
              emisario1: self.initiatorEmisarioRef,
              owner1: self.initiatorEmisarioRef.owner!.address,
              owner2: partnerAddress
            )

            // Distribute the Claim Tickets
            let partnerCollection = self.partnerCollectionCap.borrow()
              ?? panic("Could not borrow partner's collection.")
            partnerCollection.deposit(token: <- tickets.removeFirst())

            self.initiatorCollectionRef.deposit(token: <- tickets.removeFirst())

            destroy tickets
          }
        }
      `;

      const response = await fcl.mutate({
        cadence: transactionCode,
        args: (arg: any, t: any) => [arg(partnerAddress, t.Address)],
        authorizations: [this.createAuthorizationFunction(initiatorAddress)],
        payer: this.createAuthorizationFunction(initiatorAddress),
        proposer: this.createAuthorizationFunction(initiatorAddress),
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

  /**
   * Crea una función de autorización para una dirección específica
   */
  private createAuthorizationFunction(address: string) {
    return async (account: any) => {
      return {
        ...account,
        addr: address,
        keyId: 0,
        signingFunction: async (signable: any) => {
          // En un frontend real, esto sería manejado por el wallet del usuario
          // Aquí simulamos para el backend
          return {
            signature: 'user_signature',
            keyId: 0,
            addr: address
          };
        }
      };
    };
  }

  /**
   * Obtiene la dirección del contrato ClandestineNetwork
   */
  private getClandestineNetworkAddress(): string {
    return config.flow.oracleAddress; // Usamos la misma dirección donde desplegamos
  }
}