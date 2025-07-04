import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as fcl from '@onflow/fcl';

interface User {
  addr: string;
  cid: string;
  loggedIn: boolean;
  displayName?: string;
  avatar?: string;
  publicKey?: string;
  emisarioId?: string;
  level?: number;
  xp?: number;
  skillPoints?: number;
  joinedAt?: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Authenticate with Flow wallet
          const user = await fcl.authenticate();
          
          if (user.addr) {
            // Check if user exists in our backend
            const response = await fetch(`http://localhost:8080/api/users/${user.addr}`);
            let userData: User = {
              addr: user.addr,
              cid: user.cid,
              loggedIn: true,
            };

            if (response.ok) {
              const backendUser = await response.json();
              userData = {
                ...userData,
                ...backendUser.data,
                joinedAt: new Date(backendUser.data.joinedAt),
              };
            }

            set({ 
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          await fcl.unauthenticate();
          
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          
          // Subscribe to FCL current user
          fcl.currentUser.subscribe((user: any) => {
            if (user.loggedIn) {
              const userData: User = {
                addr: user.addr,
                cid: user.cid,
                loggedIn: true,
              };
              
              set({ 
                user: userData,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({ 
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          });
        } catch (error) {
          console.error('Initialize auth error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Initialization failed',
            isLoading: false,
          });
        }
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 