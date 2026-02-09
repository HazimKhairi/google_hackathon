'use client';

import { useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ResultsScreen } from '@/components/game';
import { useGameStore } from '@/stores/useGameStore';

export default function ResultsPage() {
    const router = useRouter();
    const { winnerId, rankings, players, roomId } = useGameStore();

    useEffect(() => {
        if (!roomId) {
            router.push('/');
        }
    }, [roomId, router]);

    // Transform rankings to include player names
    const rankingsWithNames = rankings.map(r => {
        const player = players.find(p => p.id === r.playerId);
        return {
            ...r,
            playerName: player?.name || 'Unknown Player',
        };
    });

    const winner = players.find(p => p.id === winnerId);
    const winnerName = winner?.name || 'Unknown Winner';

    return (
        <main className="relative min-h-screen w-full bg-[#051C22] text-[#f8fafc] flex flex-col items-center justify-center overflow-hidden font-serif">
            {/* --- LAYER 1: BACKGROUND GLOW --- */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />

            {/* --- LAYER 2: DECORATIVE BORDER SVG --- */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-6">
                <Image
                    src="/leaderboardBorder.svg"
                    alt="Decorative Pattern"
                    fill
                    className="object-fill opacity-60"
                    priority
                />
            </div>

            {/* --- LAYER 3: VIGNETTE --- */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_#000000_120%)] z-10" />

            {/* Main Content Container */}
            <div className="relative z-20 w-full max-w-7xl min-h-screen flex flex-col items-center justify-center p-8">
                <ResultsScreen
                    winnerId={winnerId || ''}
                    winnerName={winnerName}
                    rankings={rankingsWithNames}
                    onPlayAgain={() => {
                        // Reset game state and go back to lobby
                        router.push(`/lobby?room=${roomId}`);
                    }}
                />
            </div>
        </main>
    );
}
