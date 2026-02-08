'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { GeneratedImage } from '@/types';

interface ImageComparisonProps {
  gmImage: string | null;
  playerImages: GeneratedImage[];
  rankings: Array<{ playerId: string; similarity: number }>;
  winnerId: string | null;
}

export function ImageComparison({ gmImage, playerImages, rankings, winnerId }: ImageComparisonProps) {
  const getSimilarity = (playerId: string) => {
    const ranking = rankings.find((r) => r.playerId === playerId);
    return ranking?.similarity ?? 0;
  };

  return (
    <div className="space-y-6">
      {/* GM's Original Image */}
      <Card variant="gm">
        <CardHeader>
          <CardTitle className="text-gm text-center">
            👑 Original Image (Game Master)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto aspect-square rounded-xl overflow-hidden border-2 border-gm">
            {gmImage && (
              <img
                src={gmImage}
                alt="Game Master's image"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {playerImages.map((image, index) => {
          const similarity = getSimilarity(image.playerId);
          const isWinner = image.playerId === winnerId;
          
          return (
            <motion.div
              key={image.playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card 
                variant={isWinner ? 'glow' : 'default'}
                className={cn(isWinner && 'ring-2 ring-accent-green')}
              >
                <CardContent className="p-4">
                  {/* Player Name & Winner Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-text-primary">
                      {image.playerName}
                    </span>
                    {isWinner && (
                      <motion.span
                        className="bg-accent-green text-background px-2 py-0.5 rounded text-sm font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.5 }}
                      >
                        🏆 WINNER
                      </motion.span>
                    )}
                  </div>

                  {/* Image */}
                  <div className={cn(
                    'aspect-square rounded-lg overflow-hidden border-2 mb-3',
                    isWinner ? 'border-accent-green' : 'border-border'
                  )}>
                    <img
                      src={image.imageUrl}
                      alt={`${image.playerName}'s image`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Similarity Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Similarity</span>
                      <span className={cn(
                        'font-bold',
                        similarity >= 80 ? 'text-accent-green' :
                        similarity >= 50 ? 'text-gm' : 'text-accent-pink'
                      )}>
                        {similarity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          similarity >= 80 ? 'bg-accent-green' :
                          similarity >= 50 ? 'bg-gm' : 'bg-accent-pink'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${similarity}%` }}
                        transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Prompt Used */}
                  {image.prompt && (
                    <div className="mt-3 p-2 bg-background rounded text-xs text-text-muted">
                      Guess: "{image.prompt}"
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
