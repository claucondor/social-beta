import { create } from 'zustand';
import * as fcl from '@onflow/fcl';

// Tipos para el juego
interface Message {
  id?: string;
  recipientAddress: string;
  senderAddress?: string;
  encryptedContent: string;
  deliveryTimestamp: number;
  createdAt: number;
  processed?: boolean;
}

interface Bond {
  id: string;
  tokenId: string;
  ownerAddress: string;
  recipientAddress: string;
  level: number;
  artSeed: string[];
  codexURI?: string;
  thumbnail?: string;
  lastEvolution?: number;
}

interface GameStore {
  // State
  messages: Message[];
  bonds: Bond[];
  selectedBond: Bond | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (recipientAddress: string, content: string, delayMinutes?: number) => Promise<boolean>;
  fetchMessages: (userAddress: string) => Promise<void>;
  createBond: (partnerAddress: string) => Promise<boolean>;
  fetchBonds: (userAddress: string) => Promise<void>;
  selectBond: (bond: Bond | null) => void;
  clearError: () => void;
  
  // Utilities
  searchUsers: (query: string) => Promise<any[]>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  messages: [],
  bonds: [],
  selectedBond: null,
  isLoading: false,
  error: null,

  // Send a message with optional delay
  sendMessage: async (recipientAddress: string, content: string, delayMinutes = 0) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Encrypt content properly
      const encryptedContent = btoa(content); // Basic encoding for MVP
      
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress,
          encryptedContent,
          delayMinutes
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: result.error, isLoading: false });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Fetch messages for user
  fetchMessages: async (userAddress: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${userAddress}`);
      const result = await response.json();
      
      if (result.success) {
        // TODO: Decrypt messages properly
        const decryptedMessages = result.data.map((msg: Message) => ({
          ...msg,
          content: atob(msg.encryptedContent) // Basic decoding for MVP
        }));
        
        set({ messages: decryptedMessages, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create a bond between users
  createBond: async (partnerAddress: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bonds/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initiatorAddress: (await fcl.currentUser.snapshot()).addr,
          partnerAddress
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data.transactionCode) {
        try {
          // Execute transaction with Flow wallet
          const transactionId = await fcl.mutate({
            cadence: result.data.transactionCode,
            args: (arg: any, t: any) => result.data.args ? result.data.args.map((a: any) => arg(a, t.Address)) : [],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 1000
          });
          
          console.log('Bond creation transaction sent:', transactionId);
          
          // Wait for transaction to be sealed
          await fcl.tx(transactionId).onceSealed();
          
          set({ isLoading: false });
          return true;
        } catch (txError) {
          console.error('Transaction failed:', txError);
          set({ error: 'Transaction failed', isLoading: false });
          return false;
        }
      } else {
        set({ error: result.error || 'Failed to create bond', isLoading: false });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bond';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Fetch bonds for user
  fetchBonds: async (userAddress: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Implement backend endpoint for user bonds
      // For now, we'll use a placeholder
      set({ bonds: [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bonds';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Select a bond for detailed view
  selectBond: (bond: Bond | null) => {
    set({ selectedBond: bond });
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Search for users
  searchUsers: async (query: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}&limit=20`);
      const result = await response.json();
      
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
})); 