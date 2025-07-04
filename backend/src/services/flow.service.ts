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
}