'use client';

// Mock Echo for frontend-only mode
import { MOCK_PLAYERS } from './mockData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListenerCallback = (data: any) => void;

class MockChannel {
    name: string;
    listeners: Record<string, ListenerCallback[]> = {};

    constructor(name: string) {
        this.name = name;
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('mock:game-start', () => {
                this.trigger('.game.start', {});
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trigger(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    here(callback: ListenerCallback) {
        // Simulate users currently in the room
        setTimeout(() => callback(MOCK_PLAYERS), 100);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    joining(_callback: ListenerCallback) {
        // Could simulate new users joining
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    leaving(_callback: ListenerCallback) {
        return this;
    }

    listen(event: string, callback: ListenerCallback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(_callback: ListenerCallback) {
        return this;
    }

    stopListening(event: string) {
        delete this.listeners[event];
    }
}

class MockEcho {
    channels: Record<string, MockChannel> = {};

    join(channelName: string) {
        console.log(`[MockEcho] Joining channel: ${channelName}`);
        if (!this.channels[channelName]) {
            this.channels[channelName] = new MockChannel(channelName);
        }
        return this.channels[channelName];
    }

    leave(channelName: string) {
        console.log(`[MockEcho] Leaving channel: ${channelName}`);
        delete this.channels[channelName];
    }
    
    // Add other Echo methods if needed
    private(channelName: string) { return this.join(channelName); }
    channel(channelName: string) { return this.join(channelName); }
}

export const getEcho = () => {
    if (typeof window === 'undefined') return null;
    return new MockEcho();
};
