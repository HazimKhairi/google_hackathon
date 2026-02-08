'use client';

import { create } from 'zustand';
import type { GamePhase, Player, Message, GeneratedImage } from '@/types';

interface GameStore {
  // Room state
  roomId: string | null;
  playerId: string | null;
  playerName: string | null;
  authToken: string | null; // Added for guest auth
  
  // Game state
  phase: GamePhase;
  players: Player[];
  gameMasterId: string | null;
  messages: Message[];
  
  // GM specific
  gmPrompt: string | null;
  gmImage: string | null;
  gmDescription: string | null;
  
  // Player images
  playerImages: GeneratedImage[];
  
  // Results
  winnerId: string | null;
  rankings: Array<{ playerId: string; similarity: number }>;
  
  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuthToken: (token: string) => void;
  setRoom: (roomId: string, playerId: string, playerName: string) => void;
  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setGameMaster: (gameMasterId: string) => void;
  setGMPrompt: (prompt: string, imageUrl: string) => void;
  setGMDescription: (description: string) => void;
  addMessage: (message: Message) => void;
  addPlayerImage: (image: GeneratedImage) => void;
  setRankings: (rankings: Array<{ playerId: string; similarity: number }>) => void;
  setWinner: (winnerId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
  
  // Computed helpers
  isGameMaster: () => boolean;
  getCurrentPlayer: () => Player | undefined;
}

const initialState = {
  roomId: null,
  playerId: null,
  playerName: null,
  authToken: null,
  phase: 'waiting' as GamePhase,
  players: [],
  gameMasterId: null,
  messages: [],
  gmPrompt: null,
  gmImage: null,
  gmDescription: null,
  playerImages: [],
  winnerId: null,
  rankings: [],
  isLoading: false,
  error: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setAuthToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
    set({ authToken: token });
  },

  setRoom: (roomId, playerId, playerName) => 
    set({ roomId, playerId, playerName }),

  setPhase: (phase) => 
    set({ phase }),

  setPlayers: (players) => 
    set({ players }),

  addPlayer: (player) => 
    set((state) => {
      const exists = state.players.some((p) => p.id === player.id);
      if (exists) {
        return {
           players: state.players.map((p) => p.id === player.id ? player : p)
        };
      }
      return { 
        players: [...state.players, player] 
      };
    }),

  removePlayer: (playerId) => 
    set((state) => ({ 
      players: state.players.filter((p) => p.id !== playerId) 
    })),

  setGameMaster: (gameMasterId) => 
    set((state) => ({
      gameMasterId,
      players: state.players.map((p) => ({
        ...p,
        isGameMaster: p.id === gameMasterId,
      })),
    })),

  setGMPrompt: (prompt, imageUrl) => 
    set({ gmPrompt: prompt, gmImage: imageUrl }),

  setGMDescription: (description) => 
    set({ gmDescription: description }),

  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),

  addPlayerImage: (image) => 
    set((state) => ({ 
      playerImages: [...state.playerImages, image] 
    })),

  setRankings: (rankings) => 
    set({ rankings }),

  setWinner: (winnerId) => 
    set({ winnerId }),

  setLoading: (isLoading) => 
    set({ isLoading }),

  setError: (error) => 
    set({ error }),

  resetGame: () => 
    set({ 
      ...initialState, 
      roomId: get().roomId,
      playerId: get().playerId,
      playerName: get().playerName,
      players: get().players,
    }),

  isGameMaster: () => {
    const { playerId, gameMasterId } = get();
    return playerId === gameMasterId;
  },

  getCurrentPlayer: () => {
    const { players, playerId } = get();
    return players.find((p) => p.id === playerId);
  },
}));
