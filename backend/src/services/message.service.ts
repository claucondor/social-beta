import { Firestore } from '@google-cloud/firestore';
import { config } from '../config';
import { Message, ApiResponse } from '../types';

export class MessageService {
  private firestore: Firestore;

  constructor() {
    this.firestore = new Firestore({
      projectId: config.gcp.projectId,
    });
  }

  /**
   * Crea un nuevo mensaje en la cola con delay
   */
  async createMessage(
    recipientAddress: string,
    encryptedContent: string,
    delayMinutes: number = 0
  ): Promise<ApiResponse<{ messageId: string; deliveryTimestamp: number }>> {
    try {
      const now = Date.now();
      const deliveryTimestamp = now + (delayMinutes * 60 * 1000);

      const message: Message = {
        recipientAddress,
        encryptedContent,
        deliveryTimestamp,
        createdAt: now,
        processed: false
      };

      const docRef = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .add(message);

      return {
        success: true,
        data: {
          messageId: docRef.id,
          deliveryTimestamp
        },
        timestamp: now
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Obtiene mensajes listos para entregar
   */
  async getReadyMessages(): Promise<Message[]> {
    try {
      const now = Date.now();
      const snapshot = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .where('processed', '==', false)
        .where('deliveryTimestamp', '<=', now)
        .orderBy('deliveryTimestamp')
        .limit(50) // Procesar máximo 50 mensajes por lote
        .get();

      const messages: Message[] = [];
      snapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });

      return messages;
    } catch (error) {
      console.error('Error fetching ready messages:', error);
      return [];
    }
  }

  /**
   * Marca un mensaje como procesado
   */
  async markMessageAsProcessed(messageId: string): Promise<boolean> {
    try {
      await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .doc(messageId)
        .update({
          processed: true,
          processedAt: Date.now()
        });

      return true;
    } catch (error) {
      console.error('Error marking message as processed:', error);
      return false;
    }
  }

  /**
   * Obtiene los mensajes de un destinatario específico
   */
  async getMessagesForRecipient(recipientAddress: string): Promise<Message[]> {
    try {
      const snapshot = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .where('recipientAddress', '==', recipientAddress)
        .where('processed', '==', true)
        .orderBy('deliveryTimestamp', 'desc')
        .limit(20)
        .get();

      const messages: Message[] = [];
      snapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });

      return messages;
    } catch (error) {
      console.error('Error fetching messages for recipient:', error);
      return [];
    }
  }

  /**
   * Elimina mensajes procesados antiguos (limpieza)
   */
  async cleanupOldMessages(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      const snapshot = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .where('processed', '==', true)
        .where('processedAt', '<=', cutoffTime)
        .limit(100)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      const batch = this.firestore.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de la cola de mensajes
   */
  async getQueueStats(): Promise<{
    pending: number;
    processed: number;
    overdue: number;
  }> {
    try {
      const now = Date.now();
      
      // Mensajes pendientes
      const pendingSnapshot = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .where('processed', '==', false)
        .count()
        .get();

      // Mensajes procesados
      const processedSnapshot = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .where('processed', '==', true)
        .count()
        .get();

      // Mensajes vencidos (no procesados y ya pasó su tiempo)
      const overdueSnapshot = await this.firestore
        .collection(config.firestore.messageQueueCollection)
        .where('processed', '==', false)
        .where('deliveryTimestamp', '<=', now)
        .count()
        .get();

      return {
        pending: pendingSnapshot.data().count,
        processed: processedSnapshot.data().count,
        overdue: overdueSnapshot.data().count
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { pending: 0, processed: 0, overdue: 0 };
    }
  }

  /**
   * Procesa la entrega de un mensaje específico
   */
  async deliverMessage(message: Message): Promise<boolean> {
    try {
      // Aquí simularíamos la entrega del mensaje al destinatario
      // En un sistema real, esto podría involucrar:
      // - Envío de notificaciones push
      // - Actualización de estado en la blockchain
      // - Envío de emails/SMS
      
      console.log(`Delivering message ${message.id} to ${message.recipientAddress}`);
      
      // Marcar como procesado
      const success = await this.markMessageAsProcessed(message.id!);
      
      if (success) {
        console.log(`Message ${message.id} delivered successfully`);
      }
      
      return success;
    } catch (error) {
      console.error('Error delivering message:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo usuario en Firestore
   */
  async createUser(
    address: string,
    displayName?: string,
    country?: string,
    publicKey?: string
  ): Promise<ApiResponse<{ address: string; displayName?: string; country?: string }>> {
    try {
      const now = Date.now();
      const userData = {
        address,
        displayName: displayName || `Emisario_${address.slice(-6)}`,
        country: country || '',
        publicKey: publicKey || '',
        joinedAt: now,
        totalBonds: 0,
        totalXP: 0,
        lastActive: now,
        status: 'active'
      };

      await this.firestore
        .collection(config.firestore.usersCollection)
        .doc(address)
        .set(userData);

      return {
        success: true,
        data: {
          address: userData.address,
          displayName: userData.displayName,
          country: userData.country
        },
        timestamp: now
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Obtiene información de un usuario
   */
  async getUser(address: string): Promise<any> {
    try {
      const doc = await this.firestore
        .collection(config.firestore.usersCollection)
        .doc(address)
        .get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Actualiza la clave pública de un usuario
   */
  async updateUserPublicKey(address: string, publicKey: string): Promise<boolean> {
    try {
      await this.firestore
        .collection(config.firestore.usersCollection)
        .doc(address)
        .update({
          publicKey,
          lastActive: Date.now()
        });

      return true;
    } catch (error) {
      console.error('Error updating user public key:', error);
      return false;
    }
  }

  /**
   * Actualiza estadísticas de usuario
   */
  async updateUserStats(address: string, updates: { totalBonds?: number; totalXP?: number }): Promise<boolean> {
    try {
      await this.firestore
        .collection(config.firestore.usersCollection)
        .doc(address)
        .update({
          ...updates,
          lastActive: Date.now()
        });

      return true;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  /**
   * Busca usuarios por nombre o dirección
   */
  async searchUsers(query: string, limit: number = 20): Promise<any[]> {
    try {
      // Buscar por displayName (parcial)
      const nameSnapshot = await this.firestore
        .collection(config.firestore.usersCollection)
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(limit)
        .get();

      const users: any[] = [];
      nameSnapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Si no hay resultados suficientes y parece una dirección
      if (users.length < limit && query.startsWith('0x')) {
        const addressDoc = await this.firestore
          .collection(config.firestore.usersCollection)
          .doc(query)
          .get();

        if (addressDoc.exists && !users.find(u => u.address === query)) {
          users.push({
            id: addressDoc.id,
            ...addressDoc.data()
          });
        }
      }

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}