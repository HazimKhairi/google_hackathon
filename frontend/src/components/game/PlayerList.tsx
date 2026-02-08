'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getInitials } from '@/lib/utils';
import type { Player } from '@/types';

interface PlayerListProps {
  players: Player[];
  gameMasterId: string | null;
  currentPlayerId: string | null;
}

export function PlayerList({ players, gameMasterId, currentPlayerId }: PlayerListProps) {
  const maxPlayers = 4;
  const emptySlots = maxPlayers - players.length;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
        Players ({players.length}/{maxPlayers})
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border',
              player.id === gameMasterId 
                ? 'bg-gm/10 border-gm text-gm' 
                : 'bg-surface border-border text-text-primary',
              player.id === currentPlayerId && 'ring-2 ring-primary'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
              player.id === gameMasterId ? 'bg-gm text-background' : 'bg-primary text-white'
            )}>
              {getInitials(player.name)}
            </div>
            
            {/* Name */}
            <span className="font-medium text-sm">
              {player.name}
              {player.id === currentPlayerId && ' (You)'}
            </span>
            
            {/* GM Badge */}
            {player.id === gameMasterId && (
              <span className="text-xs bg-gm text-background px-1.5 py-0.5 rounded font-bold">
                GM
              </span>
            )}
            
            {/* Connection Status */}
            <div className={cn(
              'w-2 h-2 rounded-full',
              player.isConnected ? 'bg-accent-green' : 'bg-red-500'
            )} />
          </motion.div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-text-muted"
          >
            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center">
              <span className="text-lg">?</span>
            </div>
            <span className="text-sm">Waiting...</span>
          </div>
        ))}
      </div>
    </div>
  );
}
