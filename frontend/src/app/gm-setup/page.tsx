'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import { sendGMPrompt, subscribeToRoom, disconnectSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function GMSetupPage() {
    const router = useRouter();
    const { roomId, setGMPrompt } = useGameStore();
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) {
            router.push('/');
            return;
        }

        subscribeToRoom(roomId);

        return () => {
            disconnectSocket();
        };
    }, [roomId, router]);

    const handleGenerateImage = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            // Generate image via backend (ApiFree -> Replicate -> Placeholder)
            const url = await api.generateImage(prompt.trim());
            setImageUrl(url);
        } catch (err) {
            console.error('[GM Setup] Backend image generation failed:', err);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendToPlayers = async () => {
        if (!imageUrl || !prompt.trim()) return;

        setIsSending(true);
        setError(null);

        try {
            await sendGMPrompt(prompt.trim(), imageUrl);

            // Update store so the GM page has the prompt + image
            setGMPrompt(prompt.trim(), imageUrl);

            // Navigate to GM description page
            router.push('/game-master');
        } catch (err) {
            console.error('[GM Setup] Error sending prompt:', err);
            setError(err instanceof Error ? err.message : 'Failed to send prompt');
            setIsSending(false);
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

            {/* Main Content */}
            <div className="relative z-20 w-full max-w-4xl min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-[#E5B96F]/10">

                    <h2 className="text-2xl text-[#E5B96F] text-center mb-2 uppercase tracking-widest font-bold">
                        Game Master Setup
                    </h2>
                    <p className="text-[#E5B96F]/50 text-sm text-center mb-8 tracking-wide">
                        Enter a secret prompt and generate the image for players to guess
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT: Image Preview */}
                        <div className="h-[400px] rounded-xl overflow-hidden border border-[#E5B96F]/20 bg-black/40 relative">
                            {imageUrl ? (
                                <motion.img
                                    src={imageUrl}
                                    alt="Generated image"
                                    className="w-full h-full object-cover"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            ) : isGenerating ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 border-4 border-[#E5B96F]/30 border-t-[#E5B96F] rounded-full animate-spin" />
                                    <p className="text-[#E5B96F]/60 text-sm animate-pulse uppercase tracking-widest">
                                        AI is painting...
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-[#E5B96F]/30">
                                    <span className="text-6xl opacity-30">🎨</span>
                                    <p className="text-sm uppercase tracking-widest">Your image will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Prompt Input & Actions */}
                        <div className="flex flex-col gap-4">
                            {/* Prompt Input */}
                            <div className="flex-1 flex flex-col gap-3">
                                <label className="text-[#E5B96F]/70 text-xs uppercase tracking-widest">
                                    Secret Prompt
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. A mystical dragon flying through moonlit clouds above an ancient castle..."
                                    className="w-full flex-1 min-h-[150px] p-4 bg-black/40 border border-[#E5B96F]/20 rounded-lg text-white placeholder:text-white/20 text-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#E5B96F]/50 resize-none transition-all"
                                    disabled={isSending}
                                />
                                <p className="text-[#E5B96F]/30 text-xs tracking-wide">
                                    This prompt is secret. Players will only see the generated image and your description.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                {/* Generate Image Button */}
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={!prompt.trim() || isGenerating || isSending}
                                    className="w-full py-3 px-6 rounded-lg font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#E5B96F]/20 text-[#E5B96F] border border-[#E5B96F]/30 hover:bg-[#E5B96F]/30 active:scale-[0.98]"
                                >
                                    {isGenerating ? 'Generating...' : imageUrl ? 'Regenerate Image' : 'Generate Image'}
                                </button>

                                {/* Send to Players Button */}
                                {imageUrl && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={handleSendToPlayers}
                                        disabled={isSending}
                                        className="w-full py-4 px-6 rounded-lg font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-600 to-amber-800 text-white border border-amber-500/50 hover:from-amber-500 hover:to-amber-700 shadow-lg shadow-amber-900/30 active:scale-[0.98]"
                                    >
                                        {isSending ? 'Sending...' : 'Confirm & Send to Players'}
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
