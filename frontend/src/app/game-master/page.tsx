'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { GMPanel } from '@/components/game';
import { useGameStore } from '@/stores/useGameStore';
import { sendDescription, subscribeToRoom, disconnectSocket } from '@/lib/socket';
import '@/lib/debug'; // Enable network debugging

export default function GameMasterPage() {
    const router = useRouter();
    const { gmPrompt, gmImage, gmDescription, roomId } = useGameStore();
    const [isDescribing, setIsDescribing] = useState(true);

    useEffect(() => {
        if (!roomId) {
            router.push('/');
            return;
        }

        // If GM hasn't created a prompt + image yet, redirect to setup
        if (!gmPrompt || !gmImage) {
            router.push('/gm-setup');
            return;
        }

        console.log('[GM] Subscribing to room:', roomId);

        // Subscribe to the room channel so we can send events
        subscribeToRoom(roomId);

        // If description already submitted, set state accordingly
        if (gmDescription) {
            setIsDescribing(false);
        }

        // Cleanup on unmount
        return () => {
            disconnectSocket();
        };
    }, [roomId, gmPrompt, gmImage, gmDescription, router]);

    const handleSubmit = async (desc: string) => {
        console.log('[GM] ========== SUBMIT DESCRIPTION START ==========');
        console.log('[GM] Room ID:', roomId);
        console.log('[GM] Description:', desc);
        console.log('[GM] Description length:', desc.length);

        try {
            console.log('[GM] Calling sendDescription...');
            const result = await sendDescription(desc);
            console.log('[GM] sendDescription result:', result);

            setIsDescribing(false);
            console.log('[GM] Description submitted successfully!');
            console.log('[GM] ========== SUBMIT DESCRIPTION END ==========');
        } catch (error) {
            console.error('[GM] ========== ERROR SUBMITTING DESCRIPTION ==========');
            console.error('[GM] Error:', error);
            console.error('[GM] Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('[GM] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('[GM] ========== ERROR END ==========');
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
                    <h2 className="text-2xl text-[#E5B96F] text-center mb-6 uppercase tracking-widest font-bold">Game Master View</h2>
                    <GMPanel
                        prompt={gmPrompt || 'Loading prompt...'}
                        imageUrl={gmImage || ''}
                        isDescribing={isDescribing}
                        onSubmitDescription={handleSubmit}
                    />
                </div>
            </div>
        </main>
    );
}
