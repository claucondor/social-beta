/**
 * CryptoService - Manejo de criptografía E2E para mensajes
 * Utiliza RSA-OAEP para criptografía asimétrica
 * Almacena claves privadas en localStorage por address
 */

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface ExportedKeyPair {
  publicKeyPem: string;
  privateKeyPem: string;
}

export class CryptoService {
  private static readonly ALGORITHM = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  };

  private static readonly STORAGE_PREFIX = 'emisario_private_key_';

  /**
   * Genera un nuevo par de claves RSA-OAEP
   */
  static async generateKeyPair(): Promise<KeyPair> {
    try {
      const keyPair = await crypto.subtle.generateKey(
        this.ALGORITHM,
        true, // extractable
        ['encrypt', 'decrypt']
      );

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
      };
    } catch (error) {
      throw new Error(`Error generating key pair: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Exporta las claves a formato PEM
   */
  static async exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair> {
    try {
      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      const publicKeyPem = this.arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');
      const privateKeyPem = this.arrayBufferToPem(privateKeyBuffer, 'PRIVATE KEY');

      return {
        publicKeyPem,
        privateKeyPem
      };
    } catch (error) {
      throw new Error(`Error exporting key pair: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Importa claves desde formato PEM
   */
  static async importKeyPair(exportedKeyPair: ExportedKeyPair): Promise<KeyPair> {
    try {
      const publicKeyBuffer = this.pemToArrayBuffer(exportedKeyPair.publicKeyPem);
      const privateKeyBuffer = this.pemToArrayBuffer(exportedKeyPair.privateKeyPem);

      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        this.ALGORITHM,
        true,
        ['encrypt']
      );

      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        this.ALGORITHM,
        true,
        ['decrypt']
      );

      return { publicKey, privateKey };
    } catch (error) {
      throw new Error(`Error importing key pair: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Importa solo la clave pública desde PEM
   */
  static async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    try {
      const publicKeyBuffer = this.pemToArrayBuffer(publicKeyPem);
      
      return await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        this.ALGORITHM,
        true,
        ['encrypt']
      );
    } catch (error) {
      throw new Error(`Error importing public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Guarda la clave privada en localStorage asociada a una address
   */
  static savePrivateKey(address: string, privateKeyPem: string): void {
    try {
      const storageKey = this.STORAGE_PREFIX + address.toLowerCase();
      localStorage.setItem(storageKey, privateKeyPem);
      console.log(`🔐 Clave privada guardada para ${address.slice(0, 8)}...`);
    } catch (error) {
      throw new Error(`Error saving private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene la clave privada desde localStorage para una address
   */
  static getPrivateKey(address: string): string | null {
    try {
      const storageKey = this.STORAGE_PREFIX + address.toLowerCase();
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.error('Error getting private key:', error);
      return null;
    }
  }

  /**
   * Verifica si existe una clave privada para una address
   */
  static hasPrivateKey(address: string): boolean {
    return this.getPrivateKey(address) !== null;
  }

  /**
   * Configura o recupera claves para una address
   */
  static async setupKeysForAddress(address: string): Promise<ExportedKeyPair> {
    try {
      const existingPrivateKey = this.getPrivateKey(address);
      
      if (existingPrivateKey) {
        console.log(`🔐 Claves existentes encontradas para ${address.slice(0, 8)}...`);
        
        // Intentar obtener la clave pública desde blockchain
        const publicKeyFromBlockchain = await this.getPublicKeyFromBlockchain(address);
        
        if (publicKeyFromBlockchain) {
          console.log(`📢 Clave pública recuperada desde blockchain`);
          return {
            publicKeyPem: publicKeyFromBlockchain,
            privateKeyPem: existingPrivateKey
          };
        } else {
          console.log(`⚠️ No se pudo recuperar clave pública desde blockchain, generando nuevas claves`);
          // Continuar con la generación de nuevas claves
        }
      }

      console.log(`🔐 Generando nuevas claves para ${address.slice(0, 8)}...`);
      const keyPair = await this.generateKeyPair();
      const exportedKeyPair = await this.exportKeyPair(keyPair);

      // Guardar clave privada en localStorage
      this.savePrivateKey(address, exportedKeyPair.privateKeyPem);

      return exportedKeyPair;
    } catch (error) {
      throw new Error(`Error setting up keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encripta un mensaje usando la clave pública del destinatario
   */
  static async encryptMessage(message: string, recipientPublicKeyPem: string): Promise<string> {
    try {
      const publicKey = await this.importPublicKey(recipientPublicKeyPem);
      const messageBuffer = new TextEncoder().encode(message);
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        messageBuffer
      );

      // Convertir a base64 para almacenamiento
      return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    } catch (error) {
      throw new Error(`Error encrypting message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Desencripta un mensaje usando la clave privada propia
   */
  static async decryptMessage(encryptedMessage: string, ownerAddress: string): Promise<string> {
    try {
      const privateKeyPem = this.getPrivateKey(ownerAddress);
      if (!privateKeyPem) {
        throw new Error('Private key not found for this address');
      }

      const keyPair = await this.importKeyPair({ 
        publicKeyPem: '', // No necesitamos la pública para desencriptar
        privateKeyPem 
      });

      // Convertir desde base64
      const encryptedBuffer = new Uint8Array(
        atob(encryptedMessage)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        keyPair.privateKey,
        encryptedBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new Error(`Error decrypting message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Limpia todas las claves almacenadas (útil para logout)
   */
  static clearAllKeys(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('🔐 Todas las claves han sido eliminadas');
    } catch (error) {
      console.error('Error clearing keys:', error);
    }
  }

  /**
   * Obtiene la clave pública de un usuario desde blockchain
   */
  static async getPublicKeyFromBlockchain(address: string): Promise<string | null> {
    try {
      const { FlowService } = await import('./flowService');
      return await FlowService.getPublicKey(address);
    } catch (error) {
      console.error('Error getting public key from blockchain:', error);
      return null;
    }
  }

  // --- Utilidades ---

  /**
   * Convierte ArrayBuffer a formato PEM
   */
  private static arrayBufferToPem(buffer: ArrayBuffer, type: string): string {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`;
  }

  /**
   * Convierte PEM a ArrayBuffer
   */
  private static pemToArrayBuffer(pem: string): ArrayBuffer {
    const base64 = pem
      .replace(/-----BEGIN.*-----/, '')
      .replace(/-----END.*-----/, '')
      .replace(/\s/g, '');
    
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  /**
   * Genera un resumen de la clave para mostrar en UI
   */
  static getKeyFingerprint(publicKeyPem: string): string {
    const cleanKey = publicKeyPem.replace(/-----.*-----/g, '').replace(/\s/g, '');
    return cleanKey.slice(0, 16) + '...' + cleanKey.slice(-16);
  }
} 