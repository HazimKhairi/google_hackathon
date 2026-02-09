/**
 * Debug utilities for tracking network requests and errors
 */

// Monitor all fetch requests
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource instanceof Request ? resource.url : resource.toString();

    console.log('[DEBUG] 🌐 Fetch Request:', {
      url,
      method: config?.method || 'GET',
      headers: config?.headers,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await originalFetch(...args);

      console.log('[DEBUG] ✅ Fetch Response:', {
        url,
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('[DEBUG] ❌ Fetch Error:', {
        url,
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  };

  // Monitor all WebSocket connections
  const originalWebSocket = window.WebSocket;

  class MonitoredWebSocket extends originalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      console.log('[DEBUG] 🔌 WebSocket Connect:', {
        url: url.toString(),
        protocols,
        timestamp: new Date().toISOString(),
      });

      super(url, protocols);

      this.addEventListener('open', () => {
        console.log('[DEBUG] ✅ WebSocket Open:', {
          url: url.toString(),
          readyState: this.readyState,
          timestamp: new Date().toISOString(),
        });
      });

      this.addEventListener('error', (event) => {
        console.error('[DEBUG] ❌ WebSocket Error:', {
          url: url.toString(),
          event,
          readyState: this.readyState,
          timestamp: new Date().toISOString(),
        });
      });

      this.addEventListener('close', (event) => {
        console.log('[DEBUG] 🔌 WebSocket Close:', {
          url: url.toString(),
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  (window as any).WebSocket = MonitoredWebSocket;

  console.log('[DEBUG] 🔍 Network monitoring enabled');
}

export const debugLog = (category: string, message: string, data?: any) => {
  console.log(`[DEBUG:${category}]`, message, data || '');
};

export const debugError = (category: string, message: string, error: any) => {
  console.error(`[DEBUG:${category}]`, message, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    type: error instanceof Error ? error.constructor.name : typeof error,
    fullError: error,
  });
};
