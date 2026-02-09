import { getEcho } from './echo';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  JoinRoomPayload,
  GMDescriptionPayload,
  PlayerGuessPayload,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Store current channel
let currentChannel: any = null;
let currentRoomId: string | null = null;

/**
 * Get the current Echo instance
 */
export function getSocket() {
  return getEcho();
}

/**
 * Connect to Echo
 */
export function connectSocket() {
  const echo = getEcho();
  if (echo) {
    console.log('[Socket] Connected to Echo');
  }
}

/**
 * Disconnect from current channel
 */
export function disconnectSocket() {
  if (currentChannel && currentRoomId) {
    const echo = getEcho();
    if (echo) {
      echo.leaveChannel(`game.room.${currentRoomId}`);
      currentChannel = null;
      currentRoomId = null;
      console.log('[Socket] Disconnected from channel');
    }
  }
}

/**
 * Check if connected
 */
export function isConnected() {
  const echo = getEcho();
  return echo !== null;
}

/**
 * Subscribe to a room channel (public channel)
 */
export function subscribeToRoom(roomId: string) {
  const echo = getEcho();
  if (!echo) {
    console.error('[Socket] Echo not initialized');
    return null;
  }

  // Unsubscribe from previous channel if exists
  if (currentChannel && currentRoomId && currentRoomId !== roomId) {
    echo.leaveChannel(`game.room.${currentRoomId}`);
  }

  currentRoomId = roomId;
  currentChannel = echo.channel(`game.room.${roomId}`);

  console.log(`[Socket] Subscribed to room channel: game.room.${roomId}`);
  return currentChannel;
}

/**
 * Join a game room (call backend API + subscribe to channel)
 */
export async function joinRoom(roomId: string, playerId: string, playerName: string, isGameMaster = false) {
  console.log(`[Socket] Joining room ${roomId} as ${playerName} (${playerId}) - GM: ${isGameMaster}`);

  // Subscribe to the room channel
  subscribeToRoom(roomId);

  // Notify backend that player is joining
  try {
    const response = await fetch(`${API_URL}/api/game/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        playerId,
        playerName,
        isGameMaster
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to join room');
    }

    const data = await response.json();
    console.log('[Socket] Joined room successfully:', data);
    // data will include: { success, player, players, playerCount }
    return data;
  } catch (error) {
    console.error('[Socket] Error joining room:', error);
    throw error;
  }
}

/**
 * Listen for server events
 */
export function onEvent<K extends keyof ServerToClientEvents>(
  event: K,
  callback: ServerToClientEvents[K]
) {
  if (!currentChannel) {
    console.warn('[Socket] No active channel');
    return;
  }

  // Map frontend event names to backend event names
  const eventMap: Record<string, string> = {
    player_joined: 'player.joined',
    player_ready: 'player.ready',
    game_start: 'game.start',
    gm_prompt: 'gm.prompt',
    gm_description: 'gm.description',
    image_generated: 'image.generated',
    player_left: 'player.left',
  };

  const backendEvent = eventMap[event] || event;

  currentChannel.listen(`.${backendEvent}`, callback);
  console.log(`[Socket] Listening for event: ${backendEvent}`);
}

/**
 * Stop listening for an event
 */
export function offEvent(event: keyof ServerToClientEvents) {
  if (!currentChannel) {
    console.warn('[Socket] No active channel');
    return;
  }

  const eventMap: Record<string, string> = {
    player_joined: 'player.joined',
    player_ready: 'player.ready',
    game_start: 'game.start',
    gm_prompt: 'gm.prompt',
    gm_description: 'gm.description',
    image_generated: 'image.generated',
    player_left: 'player.left',
  };

  const backendEvent = eventMap[event] || event;
  currentChannel.stopListening(`.${backendEvent}`);
  console.log(`[Socket] Stopped listening for event: ${backendEvent}`);
}

/**
 * Toggle player ready status
 */
export async function toggleReady(playerId: string, isReady: boolean) {
  if (!currentRoomId) {
    console.error('[Socket] No active room');
    throw new Error('No active room.');
  }

  try {
    const response = await fetch(`${API_URL}/api/game/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: currentRoomId,
        playerId,
        isReady,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle ready');
    }

    const data = await response.json();
    console.log('[Socket] Ready toggled:', data);
    return data;
  } catch (error) {
    console.error('[Socket] Error toggling ready:', error);
    throw error;
  }
}

/**
 * Send GM prompt with image (called from GM setup page)
 */
export async function sendGMPrompt(prompt: string, imageUrl: string) {
  if (!currentRoomId) {
    console.error('[Socket] No active room');
    throw new Error('No active room. Please join a room first.');
  }

  console.log(`[Socket] Sending GM prompt to room ${currentRoomId}`);

  try {
    const response = await fetch(`${API_URL}/api/game/gm-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: currentRoomId,
        prompt,
        imageUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send GM prompt: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Socket] GM prompt sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[Socket] Error sending GM prompt:', error);
    throw error;
  }
}

/**
 * Send GM description
 */
export async function sendDescription(description: string) {
  console.log('[Socket] ========== SEND DESCRIPTION START ==========');
  console.log('[Socket] Current room ID:', currentRoomId);
  console.log('[Socket] Description:', description);
  console.log('[Socket] API URL:', API_URL);

  if (!currentRoomId) {
    console.error('[Socket] ERROR: No active room!');
    console.error('[Socket] Cannot send description without room ID');
    throw new Error('No active room. Please join a room first.');
  }

  const endpoint = `${API_URL}/api/game/send-description`;
  console.log('[Socket] Full endpoint URL:', endpoint);

  try {
    console.log('[Socket] Making POST request...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId: currentRoomId, description }),
    });

    console.log('[Socket] Response status:', response.status);
    console.log('[Socket] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Socket] Response error text:', errorText);
      throw new Error(`Failed to send description: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Socket] Response data:', data);
    console.log('[Socket] Description sent successfully!');
    console.log('[Socket] ========== SEND DESCRIPTION END ==========');

    return data;
  } catch (error) {
    console.error('[Socket] ========== SEND DESCRIPTION ERROR ==========');
    console.error('[Socket] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Socket] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Socket] Full error:', error);
    console.error('[Socket] ========== ERROR END ==========');
    throw error;
  }
}

/**
 * Submit player guess
 */
export async function submitGuess(playerId: string, playerName: string, guessPrompt: string) {
  if (!currentRoomId) {
    console.error('[Socket] No active room');
    return;
  }

  console.log(`[Socket] Player ${playerId} submitting guess: ${guessPrompt}`);

  try {
    const response = await fetch(`${API_URL}/api/game/submit-guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: currentRoomId,
        playerId,
        playerName,
        guessPrompt
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit guess');
    }

    const data = await response.json();
    console.log('[Socket] Guess submitted successfully:', data);
  } catch (error) {
    console.error('[Socket] Error submitting guess:', error);
  }
}

/**
 * Start the game
 */
export async function startGame(gameMasterId: string) {
  if (!currentRoomId) {
    console.error('[Socket] No active room');
    return;
  }

  console.log('[Socket] Starting game');

  try {
    const response = await fetch(`${API_URL}/api/game/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId: currentRoomId, gameMasterId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start game');
    }

    console.log('[Socket] Game started successfully');
  } catch (error) {
    console.error('[Socket] Error starting game:', error);
  }
}
