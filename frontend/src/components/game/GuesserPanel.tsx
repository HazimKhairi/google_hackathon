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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      
      {/* LEFT COLUMN: Large Image Area (Your Guess/Generated Image) */}
      <Card className="h-[500px] lg:h-auto flex flex-col p-1 border-border/50">
          <div className="w-full h-full rounded-lg overflow-hidden border border-border/30 bg-black/40 relative group">
            {hasSubmitted ? (
               playerImage && !isGenerating ? (
                  <motion.img
                    src={playerImage}
                    alt="Your generated image"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 gap-4">
                      <ImageSkeleton className="w-[80%] h-[80%]" />
                      <p className="text-accent-pink/60 animate-pulse text-sm tracking-widest uppercase">Generatiing your masterpiece...</p>
                  </div>
               )
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-muted/30 gap-4">
                    <span className="text-6xl opacity-20">🎨</span>
                    <p className="text-sm uppercase tracking-widest">Your image will appear here</p>
                </div>
            )}
             
             {hasSubmitted && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-accent-pink/80 text-xs uppercase tracking-widest text-center">
                        Your Visual Interpretation
                    </p>
                </div>
             )}
          </div>
      </Card>


      {/* RIGHT COLUMN: Stacked Bento Grid */}
      <div className="flex flex-col gap-6 h-full">
        
        {/* TOP RIGHT: GM Description (Approx 1/3 height) */}
        <Card variant="glow" className="flex-shrink-0 relative overflow-hidden">
            <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">👑</span>
                Game Master's Description
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="p-4 bg-black/40 rounded-lg border border-primary/20 flex flex-col justify-center min-h-[100px]">
                {gmDescription ? (
                    <motion.p 
                        className="text-lg md:text-xl text-text-primary italic leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        "{gmDescription}"
                    </motion.p>
                ) : (
                    <div className="flex items-center gap-3 text-text-muted opacity-60">
                         <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                         </div>
                        <span className="text-sm uppercase tracking-wider">Waiting for Game Master...</span>
                    </div>
                )}
            </div>
            </CardContent>
        </Card>

        {/* BOTTOM RIGHT: Guess Input (Approx 2/3 height) */}
        <Card className="flex-1 flex flex-col border-border/50">
            <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">🎯</span>
                {hasSubmitted ? 'Your Guess' : 'Make Your Guess'}
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
            
            {!hasSubmitted ? (
                 <>
                    <p className="text-sm text-text-secondary">
                        Based on the description above, guess the original prompt to generate your image!
                    </p>
                    
                    <textarea
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter your guess logic here..."
                        className={cn(
                        'w-full flex-1 min-h-[120px] p-4 bg-black/40 border border-border/50 rounded-lg',
                        'text-text-primary placeholder:text-text-muted/50 text-lg leading-relaxed',
                        'focus:outline-none focus:ring-1 focus:ring-accent-pink/50 resize-none transition-all'
                        )}
                        disabled={!isGuessing || isSubmitting}
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={!guess.trim() || !isGuessing || isSubmitting}
                        isLoading={isSubmitting}
                        className="w-full mt-2"
                    >
                        Submit Guess & Generate
                    </Button>
                 </>
            ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="p-4 bg-accent-pink/10 rounded-xl border border-accent-pink/20 w-full">
                        <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">You guessed:</p>
                        <p className="text-xl text-accent-pink font-medium">"{guess}"</p>
                    </div>
                    <p className="text-text-muted text-sm max-w-xs">
                        Wait for other players to finish their guesses...
                    </p>
                </div>
            )}

            </CardContent>
        </Card>

      </div>
    </div>
  );
}
