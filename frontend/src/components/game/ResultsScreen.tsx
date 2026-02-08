'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ResultsScreenProps {
  winnerId: string;
  winnerName: string;
  rankings: Array<{
    playerId: string;
    playerName: string;
    similarity: number;
  }>;
  onPlayAgain: () => void;
}

export function ResultsScreen({ winnerId, winnerName, rankings, onPlayAgain }: ResultsScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Confetti Effect */}
      <Confetti />

      {/* Winner Announcement */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          🏆
        </motion.div>
        <h1 className="text-4xl font-bold text-accent-green mb-2">
          {winnerName} Wins!
        </h1>
        <p className="text-text-secondary">
          Most similar image to the Game Master's prompt
        </p>
      </motion.div>

      {/* Leaderboard */}
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4 text-center">
            Final Rankings
          </h2>
          <div className="space-y-3">
            {rankings
              .sort((a, b) => b.similarity - a.similarity)
              .map((player, index) => (
                <motion.div
                  key={player.playerId}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    index === 0 ? 'bg-accent-green/10 border border-accent-green' :
                    index === 1 ? 'bg-gm/10 border border-gm/30' :
                    'bg-surface border border-border'
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      index === 0 ? 'bg-accent-green text-background' :
                      index === 1 ? 'bg-gm text-background' :
                      'bg-border text-text-primary'
                    )}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-text-primary">
                      {player.playerName}
                    </span>
                  </div>
                  <span className={cn(
                    'font-bold',
                    index === 0 ? 'text-accent-green' :
                    index === 1 ? 'text-gm' : 'text-text-secondary'
                  )}>
                    {player.similarity.toFixed(1)}%
                  </span>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Play Again Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button size="lg" onClick={onPlayAgain}>
          Play Again
        </Button>
      </motion.div>
    </div>
  );
}

function Confetti() {
  const colors = ['#8b5cf6', '#22d3ee', '#f472b6', '#4ade80', '#fbbf24'];
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
