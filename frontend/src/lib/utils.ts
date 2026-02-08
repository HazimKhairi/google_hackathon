import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random player name
 */
export function generatePlayerName(): string {
  const adjectives = ['Swift', 'Brave', 'Clever', 'Mighty', 'Silent', 'Fierce'];
  const nouns = ['Dragon', 'Phoenix', 'Wolf', 'Eagle', 'Tiger', 'Hawk'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

/**
 * Generate a unique room ID
 */
export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Format timestamp to readable time
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get player initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(/(?=[A-Z])/)
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
