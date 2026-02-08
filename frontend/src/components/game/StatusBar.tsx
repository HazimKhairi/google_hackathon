'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { GamePhase } from '@/types';

interface StatusBarProps {
  phase: GamePhase;
  isAIThinking?: boolean;
  isAIPainting?: boolean;
}

const phaseLabels: Record<GamePhase, string> = {
  waiting: 'Waiting for players...',
  role_reveal: 'Revealing Game Master...',
  gm_receiving: 'Game Master receiving prompt...',
  describing: 'Game Master is describing...',
  guessing: 'Submit your guess!',
  generating: 'Generating images...',
  comparing: 'AI is analyzing images...',
  results: 'Game Complete!',
};

const phaseColors: Record<GamePhase, string> = {
  waiting: 'text-text-muted',
  role_reveal: 'text-gm',
  gm_receiving: 'text-primary',
  describing: 'text-accent-cyan',
  guessing: 'text-accent-pink',
  generating: 'text-primary',
  comparing: 'text-accent-cyan',
  results: 'text-accent-green',
};

export function StatusBar({ phase, isAIThinking, isAIPainting }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
      {/* Phase indicator */}
      <div className="flex items-center gap-3">
        <PhaseIndicator phase={phase} />
        <span className={cn('font-medium', phaseColors[phase])}>
          {phaseLabels[phase]}
        </span>
      </div>
      
      {/* AI Status */}
      {(isAIThinking || isAIPainting) && (
        <AIStatus type={isAIPainting ? 'painting' : 'thinking'} />
      )}
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: GamePhase }) {
  const isActive = phase !== 'waiting' && phase !== 'results';
  
  return (
    <div className="relative">
      <div className={cn(
        'w-3 h-3 rounded-full',
        phase === 'results' ? 'bg-accent-green' : 
        phase === 'waiting' ? 'bg-text-muted' : 'bg-primary'
      )} />
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

function AIStatus({ type }: { type: 'thinking' | 'painting' }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {type === 'thinking' ? (
        <ThinkingDots />
      ) : (
        <PaintingIcon />
      )}
      <span className="text-sm text-primary font-medium">
        {type === 'thinking' ? 'AI is thinking' : 'AI is painting'}
      </span>
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-primary rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function PaintingIcon() {
  return (
    <motion.svg 
      className="w-4 h-4 text-primary" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </motion.svg>
  );
}
