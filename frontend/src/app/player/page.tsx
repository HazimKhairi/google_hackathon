'use client';

import { useState } from 'react';
import Image from "next/image";
import { GuesserPanel } from '@/components/game';
import { MOCK_IMAGES } from '@/lib/mockData';

export default function PlayerPage() {
    const [phase, setPhase] = useState<'guessing' | 'generating' | 'done'>('guessing');
    const [mockImage, setMockImage] = useState<string | null>(null);

    const handleGuess = (guess: string) => {
        console.log('Guess submitted:', guess);
        setPhase('generating');

        // Simulate generation delay
        setTimeout(() => {
            setMockImage(MOCK_IMAGES.player1Image);
            setPhase('done');
        }, 3000);
    };

    return (
        <main className="relative min-h-screen w-full bg-[#051C22] text-[#f8fafc] flex flex-col items-center justify-center overflow-hidden font-serif">
            {/* --- LAYER 1: BACKGROUND GLOW --- */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />

            {/* --- LAYER 2: DECORATIVE BORDER SVG --- */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-6">
                <Image
                    src="/background.svg"
                    alt="Decorative Pattern"
                    fill
                    className="object-cover opacity-40"
                    priority
                />
            </div>

            {/* --- LAYER 3: VIGNETTE --- */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_#000000_120%)] z-10" />

            {/* Main Content Container */}
            <div className="relative z-20 w-full max-w-7xl min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-[#E5B96F]/10">
                    <h2 className="text-2xl text-[#E5B96F] text-center mb-6 uppercase tracking-widest font-bold">Player View</h2>
                    <GuesserPanel
                        gmDescription="A beautiful sunset over a city in the clouds."
                        isGuessing={phase === 'guessing'}
                        isGenerating={phase === 'generating'}
                        playerImage={mockImage}
                        onSubmitGuess={handleGuess}
                    />
                </div>
            </div>
        </main>
    );
}
