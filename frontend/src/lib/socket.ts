'use client';

import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types';

// Placeholder WebSocket server URL - replace with actual backend URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Type-safe socket instance
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

/**
 * Get or create the WebSocket connection
 */
export function getSocket(): TypedSocket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }) as TypedSocket;
  }
  return socket;
}

/**
 * Connect to the WebSocket server
 */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

/**
 * Disconnect from the WebSocket server
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Check if socket is connected
 */
export function isConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Join a game room
 */
export function joinRoom(roomId: string, playerId: string, playerName: string): void {
  const s = getSocket();
  s.emit('join_room', { roomId, playerId, playerName });
}

/**
 * Send GM description to other players
 */
export function sendDescription(description: string): void {
  const s = getSocket();
  s.emit('send_description', { description });
}

/**
 * Submit a guess for the prompt
 */
export function submitGuess(playerId: string, guessPrompt: string): void {
  const s = getSocket();
  s.emit('submit_guess', { playerId, guessPrompt });
}

/**
 * Start the game (only room host can do this)
 */
export function startGame(): void {
  const s = getSocket();
  s.emit('start_game');
}
