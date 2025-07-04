import { create } from 'zustand';
import * as fcl from '@onflow/fcl';
import { FlowService } from '../services/flowService';

interface User {
  address: string;
  displayName?: string;
  publicKey?: string;
  joinedAt?: number;
  totalBonds?: number;
  totalXP?: number;
  isRegistered?: boolean;
  level?: number;
  xp?: number;
  skillPoints?: number;
  id?: number;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  registerUser: (displayName?: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  checkUserStatus: (address: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      console.log('🔄 Inicializando AuthStore...');
      
      // Verificar inmediatamente si hay un usuario conectado
      const currentUser = await fcl.currentUser.snapshot();
      console.log('👤 Estado inicial FCL:', currentUser);
      
      if (currentUser.loggedIn && currentUser.addr) {
        console.log('✅ Usuario ya conectado detectado:', currentUser.addr);
        // Verificar inmediatamente el estado del usuario
        get().checkUserStatus(currentUser.addr);
      } else {
        console.log('❌ No hay usuario conectado inicialmente');
        set({ user: null, isInitialized: true, isLoading: false });
      }
      
      // Subscribe to FCL current user para cambios futuros
      fcl.currentUser.subscribe((fclUser: any) => {
        console.log('🔔 FCL User change event:', fclUser);
        
        if (fclUser.loggedIn && fclUser.addr) {
          console.log('✅ Usuario logueado:', fclUser.addr);
          // User is logged in, check their status on-chain
          get().checkUserStatus(fclUser.addr);
        } else {
          console.log('❌ Usuario desconectado');
          // User is not logged in
          set({ user: null, isInitialized: true, isLoading: false });
        }
      });
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async () => {
    set({ isLoading: true });
    
    try {
      await fcl.authenticate();
      // The subscription will handle the rest
    } catch (error) {
      console.error('Error signing in:', error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
    try {
      await fcl.unauthenticate();
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ isLoading: false });
    }
  },

  registerUser: async (displayName?: string) => {
    const { user } = get();
    if (!user?.address) {
      console.error('No user address found');
      return false;
    }

    set({ isLoading: true });
    
    try {
      console.log('Starting user registration process...');
      
      // Use FlowService to register the user on-chain
      const success = await FlowService.registerUser(displayName);
      
      if (success) {
        console.log('Registration successful, checking user status...');
        // Refresh user data after successful registration
        await get().checkUserStatus(user.address);
        return true;
      } else {
        console.error('Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (userData: Partial<User>) => {
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },

  checkUserStatus: async (address: string) => {
    try {
      console.log('Checking user status for address:', address);
      
      // Check if user has Emisario on-chain
      const emisarioData = await FlowService.getEmisarioData(address);
      
      if (emisarioData && emisarioData.exists) {
        // User is registered and has Emisario
        const userData: User = {
          address,
          isRegistered: true,
          id: emisarioData.id,
          level: emisarioData.level,
          xp: emisarioData.xp,
          skillPoints: emisarioData.skillPoints,
          publicKey: emisarioData.encryptionPubKey
        };
        
        console.log('User is registered:', userData);
        
        set({ 
          user: userData, 
          isLoading: false, 
          isInitialized: true 
        });
      } else {
        // User is not registered yet
        const basicUser: User = {
          address,
          isRegistered: false
        };
        
        console.log('User is not registered yet:', basicUser);
        
        set({ 
          user: basicUser, 
          isLoading: false, 
          isInitialized: true 
        });
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      
      // Create basic user object on error
      const basicUser: User = {
        address,
        isRegistered: false
      };
      
      set({ 
        user: basicUser, 
        isLoading: false, 
        isInitialized: true 
      });
    }
  }
})); 