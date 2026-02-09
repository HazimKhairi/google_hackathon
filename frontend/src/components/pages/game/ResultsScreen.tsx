'use client';

import { LeaderboardView } from '@/components/pages/leaderboard/LeaderboardView';

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

export function ResultsScreen({ onPlayAgain }: ResultsScreenProps) {
  // LeaderboardView retrieves data from usageStore directly
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <LeaderboardView onPlayAgain={onPlayAgain} className="scale-90 origin-top" />
    </div>
  );
}
