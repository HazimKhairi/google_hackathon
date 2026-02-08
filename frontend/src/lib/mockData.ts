'use client';

import type { Player, GeneratedImage, GamePhase } from '@/types';

// Mock placeholder images (using picsum for demo)
export const MOCK_IMAGES = {
  gmImage: 'https://picsum.photos/seed/gm-image/512/512',
  player1Image: 'https://picsum.photos/seed/player1/512/512',
  player2Image: 'https://picsum.photos/seed/player2/512/512',
  player3Image: 'https://picsum.photos/seed/player3/512/512',
};

// Mock players
export const MOCK_PLAYERS: Player[] = [
  { id: 'player-1', name: 'Alex Chen', isGameMaster: true, isConnected: true, score: 0 },
  { id: 'player-2', name: 'Sarah Kim', isGameMaster: false, isConnected: true, score: 0 },
  { id: 'player-3', name: 'Mike Johnson', isGameMaster: false, isConnected: true, score: 0 },
  { id: 'player-4', name: 'Emma Wilson', isGameMaster: false, isConnected: true, score: 0 },
];

// Mock game master data
export const MOCK_GM_DATA = {
  prompt: 'A cyberpunk city with neon lights and flying cars at sunset',
  description: 'A futuristic metropolis bathed in warm orange and pink hues, with towering skyscrapers covered in glowing advertisements and vehicles hovering between buildings',
};

// Mock player images for comparison
export const MOCK_PLAYER_IMAGES: GeneratedImage[] = [
  {
    playerId: 'player-2',
    playerName: 'Sarah Kim',
    imageUrl: MOCK_IMAGES.player1Image,
    prompt: 'A sci-fi city with neon signs and flying vehicles during dusk',
    similarity: 92.5,
  },
  {
    playerId: 'player-3',
    playerName: 'Mike Johnson',
    imageUrl: MOCK_IMAGES.player2Image,
    prompt: 'Futuristic urban landscape with bright lights and hovercars',
    similarity: 78.3,
  },
  {
    playerId: 'player-4',
    playerName: 'Emma Wilson',
    imageUrl: MOCK_IMAGES.player3Image,
    prompt: 'A modern city skyline at night with colorful lights',
    similarity: 65.1,
  },
];

// Mock rankings
export const MOCK_RANKINGS = MOCK_PLAYER_IMAGES.map((img) => ({
  playerId: img.playerId,
  playerName: img.playerName,
  similarity: img.similarity ?? 0,
}));

// All game phases for demo
export const ALL_PHASES: { phase: GamePhase; label: string; description: string }[] = [
  { phase: 'waiting', label: 'Waiting', description: 'Waiting for players to join' },
  { phase: 'role_reveal', label: 'Role Reveal', description: 'Revealing who is the Game Master' },
  { phase: 'gm_receiving', label: 'GM Receiving', description: 'Game Master receiving prompt & image' },
  { phase: 'describing', label: 'Describing', description: 'Game Master describing the image' },
  { phase: 'guessing', label: 'Guessing', description: 'Players guessing the prompt' },
  { phase: 'generating', label: 'Generating', description: 'AI generating images from guesses' },
  { phase: 'comparing', label: 'Comparing', description: 'AI comparing images' },
  { phase: 'results', label: 'Results', description: 'Showing winner and rankings' },
];

// Helper to initialize mock data in the store
export function initializeMockData(
  setRoom: (roomId: string, playerId: string, playerName: string) => void,
  setPlayers: (players: Player[]) => void,
  setGameMaster: (id: string) => void,
  setGMPrompt: (prompt: string, imageUrl: string) => void,
  setGMDescription: (description: string) => void,
  addPlayerImage: (image: GeneratedImage) => void,
  setRankings: (rankings: Array<{ playerId: string; similarity: number }>) => void,
  setWinner: (winnerId: string) => void,
  options?: { isGameMaster?: boolean }
) {
  // Set room data
  const currentPlayerId = options?.isGameMaster ? 'player-1' : 'player-2';
  const currentPlayerName = options?.isGameMaster ? 'Alex Chen' : 'Sarah Kim';
  setRoom('DEMO01', currentPlayerId, currentPlayerName);
  
  // Set players
  setPlayers(MOCK_PLAYERS);
  
  // Set game master
  setGameMaster('player-1');
  
  // Set GM data
  setGMPrompt(MOCK_GM_DATA.prompt, MOCK_IMAGES.gmImage);
  setGMDescription(MOCK_GM_DATA.description);
  
  // Set player images
  MOCK_PLAYER_IMAGES.forEach((img) => addPlayerImage(img));
  
  // Set rankings
  setRankings(MOCK_RANKINGS.map((r) => ({ playerId: r.playerId, similarity: r.similarity })));
  
  // Set winner
  setWinner('player-2');
}

export const MOCK_USER = {
  id: 'user-123',
  name: 'Demo User',
  token: 'mock-token-123'
};

export const MOCK_ROOM = {
  id: 'DEMO01',
  code: 'DEMO01',
  host_id: 'player-1',
  status: 'waiting',
  players: MOCK_PLAYERS
};

export const MOCK_MESSAGES = [
  { id: 'msg-1', room_id: 'DEMO01', sender_id: 'player-1', content: 'Welcome to the game!', created_at: new Date().toISOString() },
  { id: 'msg-2', room_id: 'DEMO01', sender_id: 'player-2', content: 'Ready to play!', created_at: new Date().toISOString() }
];
