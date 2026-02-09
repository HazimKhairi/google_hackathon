// Game-related TypeScript types

export type GamePhase = 
  | 'waiting'      // Waiting for players
  | 'role_reveal'  // Revealing who is GM
  | 'gm_receiving' // GM getting prompt + image
  | 'describing'   // GM describing the image
  | 'guessing'     // Players guessing the prompt
  | 'generating'   // Generating images from guesses
  | 'comparing'    // AI comparing images
  | 'results';     // Show winner

export interface Player {
  id: string;
  name: string;
  isGameMaster: boolean;
  isConnected: boolean;
  isReady?: boolean;
  avatar?: string;
  score?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'description' | 'system' | 'guess';
  timestamp: Date;
}

export interface GeneratedImage {
  playerId: string;
  playerName: string;
  imageUrl: string;
  prompt?: string;
  similarity?: number;
}

export interface GameState {
  roomId: string | null;
  phase: GamePhase;
  players: Player[];
  gameMasterId: string | null;
  messages: Message[];
  
  // GM specific
  gmPrompt: string | null;
  gmImage: string | null;
  gmDescription: string | null;
  
  // Guessing phase
  playerImages: GeneratedImage[];
  
  // Results
  winnerId: string | null;
  rankings: Array<{
    playerId: string;
    similarity: number;
  }>;
}

export interface RoomInfo {
  roomId: string;
  playerCount: number;
  isGameStarted: boolean;
}
