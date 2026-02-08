// Stubbed Socket functions for Design Mode
import { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types';


// Store event listeners
type SocketCallback = (...args: unknown[]) => void;
const listeners: Record<string, SocketCallback[]> = {};

// Mock Socket object (partial)
const mockSocket = {
  connected: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (event: string, ...args: any[]) => {
    console.log(`[MockSocket] Emitted: ${event}`, args);
    // Simulate server response for some events
    if (event === 'start_game') {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mock:game-start'));
        }
        simulateGameFlow();
    }
  },
  on: (event: string, callback: SocketCallback) => {
    console.log(`[MockSocket] Registered listener for: ${event}`);
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  },
  off: (event: string) => {
    console.log(`[MockSocket] Removed listener for: ${event}`);
    if (listeners[event]) {
        // Simple clear for mock
        listeners[event] = [];
    }
  },
  connect: () => {
    console.log('[MockSocket] Connected');
  },
  disconnect: () => {
    console.log('[MockSocket] Disconnected');
  }
} as unknown as Socket<ServerToClientEvents, ClientToServerEvents>;

// Helper to trigger events
function triggerEvent(event: string, payload: any) {
    console.log(`[MockSocket] Triggering event: ${event}`, payload);
    if (listeners[event]) {
        listeners[event].forEach(cb => cb(payload));
    }
}

// Simulation logic
function simulateGameFlow() {
    console.log('[MockSocket] Starting game simulation...');
    
    // 1. Game Start
    setTimeout(() => {
        triggerEvent('game_start', { gameMasterId: 'player-1' });
    }, 500);

    // 2. GM Prompt (simulated after 3s)
    setTimeout(() => {
        triggerEvent('gm_prompt', { 
            prompt: 'A futuristic city', 
            imageUrl: 'https://picsum.photos/seed/gm/512/512' 
        });
    }, 4000); // Wait for role reveal (3s) + 1s

    // 3. GM Description (simulated after another 3s)
    // In real game, GM sends this manually. We can simulate it if needed, 
    // or wait for the user (if acting as GM) to call sendDescription.
}

export function getSocket() {
  return mockSocket;
}

export function connectSocket() {
  console.log('[MockSocket] connectSocket called');
}

export function disconnectSocket() {
  console.log('[MockSocket] disconnectSocket called');
}

export function isConnected() {
  return true;
}

export function joinRoom(roomId: string, playerId: string, playerName: string) {
  console.log(`[MockSocket] Joining room ${roomId} as ${playerName} (${playerId})`);
  // Simulate joining success immediately if needed
}

export function sendDescription(description: string) {
  console.log(`[MockSocket] Sending description: ${description}`);
  // Simulate server broadcasting description
  setTimeout(() => {
      triggerEvent('gm_description', { description });
  }, 500);
}

export function submitGuess(playerId: string, guessPrompt: string) {
  console.log(`[MockSocket] Player ${playerId} guessed: ${guessPrompt}`);
  // Simulate image generation completion after a delay
  setTimeout(() => {
      triggerEvent('image_generated', {
          playerId,
          playerName: 'Player ' + playerId, // simplified
          imageUrl: `https://picsum.photos/seed/${playerId}/512/512`
      });
  }, 2000);
}

export function startGame() {
  console.log('[MockSocket] Game started');
  simulateGameFlow();
}
