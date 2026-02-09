const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper for API requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// API Methods
export const api = {
  // Authentication
  loginAsGuest: async (name: string) => {
    // For now, generate a simple token client-side
    // In production, this should be a real backend auth endpoint
    return {
      token: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: {
        id: `user-${Date.now()}`,
        name,
      }
    };
  },

  // Rooms
  createRoom: async () => {
    return apiRequest('/api/rooms', {
      method: 'POST',
    });
  },

  getRoom: async (roomId: string) => {
    return apiRequest(`/api/rooms/${roomId}`);
  },

  // Players
  joinRoom: async (roomId: string, playerName: string) => {
    return apiRequest('/api/players', {
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
        name: playerName,
      }),
    });
  },

  // Messages
  getMessages: async (roomId: string) => {
    return apiRequest(`/api/messages?room_id=${roomId}`);
  },

  sendMessage: async (roomId: string, content: string, senderRole: string) => {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
        content,
        sender_role: senderRole,
      }),
    });
  },

  // AI Generation
  generateNarrative: async (roomId: string, prompt: string, context: unknown) => {
    return apiRequest('/api/messages/generate-narrative', {
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
        prompt,
        context,
      }),
    });
  },

  describeImage: async (roomId: string, imageFile: File, prompt?: string) => {
    const formData = new FormData();
    formData.append('room_id', roomId);
    formData.append('image', imageFile);
    if (prompt) {
      formData.append('prompt', prompt);
    }

    const response = await fetch(`${API_URL}/api/messages/describe-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Game-specific endpoints
  generateImage: async (prompt: string): Promise<string> => {
    const data = await apiRequest<{ success: boolean; imageUrl: string }>('/api/game/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    return data.imageUrl;
  },
};
