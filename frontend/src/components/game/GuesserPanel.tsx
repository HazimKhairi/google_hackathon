'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { ImageSkeleton } from '@/components/ui/LoadingSkeleton';
import { cn } from '@/lib/utils';

interface GuesserPanelProps {
  gmDescription: string | null;
  isGuessing: boolean;
  playerImage: string | null;
  isGenerating: boolean;
  onSubmitGuess: (guess: string) => void;
}

export function GuesserPanel({ 
  gmDescription, 
  isGuessing, 
  playerImage,
  isGenerating,
  onSubmitGuess 
}: GuesserPanelProps) {
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!guess.trim()) return;
    setIsSubmitting(true);
    setHasSubmitted(true);
    onSubmitGuess(guess);
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* GM Description */}
      <Card variant="glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            Game Master's Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gmDescription ? (
            <motion.div
              className="p-4 bg-background rounded-lg border border-primary/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-lg text-text-primary italic">
                "{gmDescription}"
              </p>
            </motion.div>
          ) : (
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 text-text-muted">
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-text-muted rounded-full" />
                  ))}
                </motion.div>
                <span>Waiting for Game Master's description...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guess Input or Generated Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            {hasSubmitted ? 'Your Generated Image' : 'Your Guess'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasSubmitted ? (
            <div className="space-y-4">
              <p className="text-text-secondary">
                Based on the description, guess what the original prompt was!
              </p>
              
              <textarea
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess for the prompt..."
                className={cn(
                  'w-full h-32 px-4 py-3 bg-background border border-border rounded-lg',
                  'text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-accent-pink resize-none'
                )}
                disabled={!isGuessing || isSubmitting}
              />

              <Button
                onClick={handleSubmit}
                disabled={!guess.trim() || !isGuessing || isSubmitting}
                isLoading={isSubmitting}
                className="w-full"
              >
                Submit Guess & Generate Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-accent-pink/10 rounded-lg border border-accent-pink/30">
                <p className="text-sm text-text-secondary">Your guess:</p>
                <p className="text-accent-pink font-medium">"{guess}"</p>
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden border border-border">
                {playerImage && !isGenerating ? (
                  <motion.img
                    src={playerImage}
                    alt="Your generated image"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <ImageSkeleton className="w-full h-full" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
