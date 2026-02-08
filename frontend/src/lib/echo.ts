'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Ensure Pusher is available globally for Echo
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Pusher = Pusher;
}

export const getEcho = () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('auth_token');

    return new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'app-key',
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                Accept: 'application/json',
            },
        },
    });
};
