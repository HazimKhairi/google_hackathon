'use client';

import Image from "next/image";
import Link from "next/link";
import { GameButton } from '@/components/ui';

export default function RoleRevealMenuPage() {
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

            {/* Main Menu Box */}
            <div className="relative z-20 w-full max-w-md p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-[#E5B96F]/20 text-center space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                <h1 className="text-3xl text-[#E5B96F] font-bold uppercase tracking-widest">
                    Role Reveal Views
                </h1>

                <div className="flex flex-col gap-4 items-center">
                    <Link href="/role-reveal/game-master">
                        <GameButton>View as Game Master</GameButton>
                    </Link>

                    <Link href="/role-reveal/player">
                        <GameButton>View as Player</GameButton>
                    </Link>
                </div>

                <p className="text-sm text-[#E5B96F]/40 uppercase tracking-wider">
                    Select a perspective to preview animation
                </p>
            </div>
        </main>
    );
}
