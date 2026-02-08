'use client';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper for API requests
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Add auth token if exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    // @ts-ignore
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// API Methods
export const api = {
  // Authentication
  loginAsGuest: async (name: string) => {
    return fetchApi('/guest-login', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  // Rooms
  createRoom: async () => {
    return fetchApi('/rooms', {
      method: 'POST',
    });
  },

  getRoom: async (roomId: string) => {
    return fetchApi(`/rooms/${roomId}`);
  },

  // Players
  joinRoom: async (roomId: string, roleName: string) => {
    return fetchApi('/players', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, role_name: roleName }),
    });
  },

  // Messages
  getMessages: async (roomId: string) => {
    return fetchApi(`/messages?room_id=${roomId}`);
  },

  sendMessage: async (roomId: string, content: string, senderRole: string) => {
    return fetchApi('/messages', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, content, sender_role: senderRole }),
    });
  },

  // AI Generation
  generateNarrative: async (roomId: string, prompt: string, context: any) => {
    return fetchApi('/messages/generate-narrative', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, prompt, context }),
    });
  },
  
  describeImage: async (roomId: string, imageFile: File, prompt?: string) => {
    const formData = new FormData();
    formData.append('room_id', roomId);
    formData.append('image', imageFile);
    if (prompt) formData.append('prompt', prompt);
    
    // Upload requires separate handling for Content-Type (browser sets multipart/form-data boundary)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/messages/describe-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Image upload failed');
    return data;
  }
};
