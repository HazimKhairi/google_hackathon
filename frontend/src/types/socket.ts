// WebSocket event types

export interface JoinRoomPayload {
  roomId: string;
  playerId: string;
  playerName: string;
}

export interface PlayerJoinedPayload {
  player: {
    id: string;
    name: string;
  };
  playerCount: number;
}

export interface GameStartPayload {
  gameMasterId: string;
}

export interface GMPromptPayload {
  prompt: string;
  imageUrl: string;
}

export interface GMDescriptionPayload {
  description: string;
}

export interface PlayerGuessPayload {
  playerId: string;
  guessPrompt: string;
}

export interface ImageGeneratedPayload {
  playerId: string;
  playerName: string;
  imageUrl: string;
}

export interface ComparisonResultPayload {
  rankings: Array<{
    playerId: string;
    playerName: string;
    similarity: number;
    imageUrl: string;
  }>;
}

export interface GameEndPayload {
  winnerId: string;
  winnerName: string;
  scores: Array<{
    playerId: string;
    similarity: number;
  }>;
}

export interface PlayerLeftPayload {
  playerId: string;
  playerCount: number;
}

// Socket event names
export type ServerToClientEvents = {
  player_joined: (payload: PlayerJoinedPayload) => void;
  game_start: (payload: GameStartPayload) => void;
  gm_prompt: (payload: GMPromptPayload) => void;
  gm_description: (payload: GMDescriptionPayload) => void;
  image_generated: (payload: ImageGeneratedPayload) => void;
  comparison_result: (payload: ComparisonResultPayload) => void;
  game_end: (payload: GameEndPayload) => void;
  player_left: (payload: PlayerLeftPayload) => void;
  error: (message: string) => void;
};

export type ClientToServerEvents = {
  join_room: (payload: JoinRoomPayload) => void;
  send_description: (payload: GMDescriptionPayload) => void;
  submit_guess: (payload: PlayerGuessPayload) => void;
  start_game: () => void;
};
