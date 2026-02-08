import { MOCK_PLAYERS, MOCK_ROOM, MOCK_MESSAGES, MOCK_GM_DATA, MOCK_USER } from './mockData';

// Helper for mocked API requests
async function mockDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// API Methods
export const api = {
  // Authentication
  loginAsGuest: async (name: string) => {
    return mockDelay({
      token: MOCK_USER.token,
      user: {
        ...MOCK_USER,
        name,
      }
    });
  },

  // Rooms
  createRoom: async () => {
    return mockDelay(MOCK_ROOM);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoom: async (_roomId: string) => {
    return mockDelay(MOCK_ROOM);
  },

  // Players
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  joinRoom: async (_roomId: string, roleName: string) => {
    return mockDelay({
      ...MOCK_PLAYERS[1], // Return a player mock
      name: roleName || 'Guest Player'
    });
  },

  // Messages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMessages: async (_roomId: string) => {
    return mockDelay(MOCK_MESSAGES);
  },

  sendMessage: async (roomId: string, content: string, senderRole: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      sender_id: 'player-current', // simplified
      content,
      created_at: new Date().toISOString(),
      sender_role: senderRole
    };
    return mockDelay(newMessage);
  },

  // AI Generation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateNarrative: async (_roomId: string, prompt: string, _context: unknown) => {
    return mockDelay({
      narrative: "This is a mocked narrative generated based on the prompt: " + prompt
    });
  },
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  describeImage: async (_roomId: string, _imageFile: File, _prompt?: string) => {
    return mockDelay({
      description: MOCK_GM_DATA.description,
      analyzed: true
    });
  }
};
