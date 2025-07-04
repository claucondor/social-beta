import { create } from 'zustand';

interface GameState {
  isInitialized: boolean;
  initializeGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isInitialized: false,
  initializeGame: () => {
    console.log('Game initialized');
    set({ isInitialized: true });
  },
})); 