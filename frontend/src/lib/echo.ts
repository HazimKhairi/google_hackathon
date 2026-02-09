'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

let echoInstance: InstanceType<typeof Echo> | null = null;

export const getEcho = () => {
  if (typeof window === 'undefined') return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'local-app-key',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8081,
      wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8081,
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });

    console.log('[Echo] Initialized with Reverb broadcaster');
  }

  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    console.log('[Echo] Disconnected');
  }
};

// Force reconnect with new player info
export const reconnectEcho = () => {
  disconnectEcho();
  return getEcho();
};
