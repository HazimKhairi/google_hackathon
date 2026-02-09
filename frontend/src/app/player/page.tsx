'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { GuesserPanel } from '@/components/game';
import { useGameStore } from '@/stores/useGameStore';
import { submitGuess, onEvent, subscribeToRoom, disconnectSocket } from '@/lib/socket';

export default function PlayerPage() {
    const router = useRouter();
    const { gmDescription, playerId, playerName, roomId, playerImages, setGMDescription } = useGameStore();
    const [phase, setPhase] = useState<'guessing' | 'generating' | 'done'>('guessing');
    const [playerImage, setPlayerImage] = useState<string | null>(null);

    // Subscribe to room channel and listen for events
    useEffect(() => {
        if (!roomId || !playerId) {
            router.push('/');
            return;
        }

        console.log('[Player] Subscribing to room:', roomId);

        // Subscribe to the room channel
        subscribeToRoom(roomId);

        // Listen for GM description event
        onEvent('gm_description', (data: { description: string }) => {
            console.log('[Player] Received GM description:', data);
            setGMDescription(data.description);
        });

        // Listen for image generated event
        onEvent('image_generated', (data: { playerId: string; playerName: string; imageUrl: string }) => {
            console.log('[Player] Image generated:', data);

            // Only update if it's this player's image
            if (data.playerId === playerId) {
                setPlayerImage(data.imageUrl);
                setPhase('done');
            }
        });

        // Cleanup on unmount
        return () => {
            disconnectSocket();
        };

    }, [roomId, playerId, router, setGMDescription]);

    // Check if player already submitted a guess
    useEffect(() => {
        const myImage = playerImages.find(img => img.playerId === playerId);
        if (myImage) {
            setPlayerImage(myImage.imageUrl);
            setPhase('done');
        }
    }, [playerImages, playerId]);

    const handleGuess = async (guess: string) => {
        if (!playerId || !playerName) return;

        console.log('[Player] Submitting guess:', guess);
        setPhase('generating');

        try {
            await submitGuess(playerId, playerName, guess);
            // The phase will change to 'done' when we receive the image_generated event
        } catch (error) {
            console.error('[Player] Error submitting guess:', error);
            setPhase('guessing');
        }
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
                        gmDescription={gmDescription || 'Waiting for Game Master description...'}
                        isGuessing={phase === 'guessing'}
                        isGenerating={phase === 'generating'}
                        playerImage={playerImage}
                        onSubmitGuess={handleGuess}
                    />
                </div>
            </div>
        </main>
    );
}
