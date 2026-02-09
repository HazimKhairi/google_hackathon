"use client";

import Image from "next/image";
import { useGameStore } from "@/stores/useGameStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LeaderboardViewProps {
    onPlayAgain?: () => void;
    className?: string;
}

export const LeaderboardView = ({ onPlayAgain, className }: LeaderboardViewProps) => {
    const { players: storePlayers, rankings, gameMasterId } = useGameStore();
    const [displayPlayers, setDisplayPlayers] = useState<Array<{ name: string; score: number; isWinner: boolean }>>([]);

    useEffect(() => {
        if (rankings.length > 0 && storePlayers.length > 0) {
            // Process real data
            const processed = rankings
                .filter(r => r.playerId !== gameMasterId) // Exclude GM
                .map((r, index) => {
                    const player = storePlayers.find(p => p.id === r.playerId);
                    return {
                        name: player?.name || "Unknown",
                        score: Math.round(r.similarity),
                        isWinner: index === 0 // Top score is winner (rankings should be sorted)
                    };
                })
                .sort((a, b) => b.score - a.score);

            // Re-calc winner after sort just in case
            const final = processed.map((p, i) => ({ ...p, isWinner: i === 0 }));
            setDisplayPlayers(final);
        } else {
            // Fallback mock data if accessed directly without game state
            setDisplayPlayers([
                { name: "PLAYER NAME", score: 100, isWinner: true },
                { name: "PLAYER NAME", score: 80, isWinner: false },
                { name: "PLAYER NAME", score: 60, isWinner: false },
            ]);
        }
    }, [storePlayers, rankings, gameMasterId]);

    return (
        <div className={`relative w-full min-h-screen bg-[#051C22] text-[#f8fafc] flex flex-col items-center justify-center overflow-hidden font-serif ${className || ''}`}>

            {/* --- LAYER 1: BACKGROUND GLOW --- */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />

            {/* --- LAYER 2: DECORATIVE BORDER SVG --- */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <Image
                    src="/leaderboardBorder.svg"
                    alt="Decorative Pattern"
                    fill
                    className="object-fill"
                    priority
                />
            </div>

            {/* --- LAYER 3: VIGNETTE --- */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_#000000_120%)] z-10" />

            {/* Main Content Container */}
            <div className="relative z-20 w-full max-w-7xl flex flex-col items-center justify-center p-8">

                {/* Header Section */}
                <div className="text-center space-y-4 mb-12 relative">
                    <h1
                        className="text-metallic text-4xl md:text-6xl lg:text-8xl font-bold tracking-widest uppercase"
                        style={{
                            WebkitTextStroke: '1px rgba(229, 185, 111, 0.3)',
                            filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))'
                        }}
                    >
                        WINNER
                    </h1>
                    <p className="text-[#E5B96F] text-lg md:text-xl tracking-wider font-light">
                        Most Similar Image to Game Master's Prompt
                    </p>
                </div>

                {/* Content Body: Trophies and Player List */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full relative">

                    {/* Left Trophy */}
                    <div className="hidden md:block w-32 h-32 md:w-64 md:h-64 lg:w-96 lg:h-96 relative animate-pulse-slow">
                        <Image
                            src="/trophy.svg"
                            alt="Trophy"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Player List */}
                    <div className="flex flex-col gap-4 w-full max-w-md z-30">
                        {displayPlayers.map((player, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    relative flex items-center justify-center w-full py-4 px-8 
                                    transition-all duration-300 cursor-pointer
                                    ${player.isWinner ? 'scale-110 mb-4' : 'opacity-80 hover:opacity-100'}
                                `}
                            >
                                {/* Winner Styling: Glow and Border */}
                                {player.isWinner ? (
                                    <div className="absolute inset-0 bg-[#E5B96F]/10 border border-[#E5B96F] rounded-lg shadow-[0_0_30px_rgba(229,185,111,0.2)]" />
                                ) : (
                                    <div className="absolute inset-0 bg-black/40 border border-[#E5B96F]/20 rounded-lg" />
                                )}

                                <span
                                    className={`
                                        relative z-10 text-center tracking-[0.2em] font-bold uppercase
                                        ${player.isWinner
                                            ? 'text-2xl md:text-3xl text-metallic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                                            : 'text-lg md:text-xl text-[#E5B96F]'}
                                    `}
                                >
                                    {player.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Trophy */}
                    <div className="hidden md:block w-32 h-32 md:w-64 md:h-64 lg:w-96 lg:h-96 relative animate-pulse-slow">
                        <Image
                            src="/trophy.svg"
                            alt="Trophy"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Play Again Button (Optional) */}
                {onPlayAgain && (
                    <div className="mt-12 relative z-30">
                        <button
                            onClick={onPlayAgain}
                            className="px-8 py-3 bg-[#E5B96F]/20 hover:bg-[#E5B96F]/30 border border-[#E5B96F] text-[#E5B96F] rounded-full uppercase tracking-widest transition-all hover:scale-105"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
