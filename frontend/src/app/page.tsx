'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GameButton } from '@/components/ui/GameMenu';
import { generateRoomId, generatePlayerName } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [view, setView] = useState<'main' | 'join' | 'create'>('main');
  const [isLoading, setIsLoading] = useState(false);

  // LOGIC: Handle Creating a Room
  const handleCreateRoom = () => {
    setIsLoading(true);
    // Simulate a brief delay for effect, or remove setTimeout if instant is preferred
    setTimeout(() => {
      const name = playerName.trim() || generatePlayerName();
      const newRoomId = generateRoomId();
      
      sessionStorage.setItem('playerName', name);
      sessionStorage.setItem('roomId', newRoomId);
      sessionStorage.setItem('isHost', 'true');
      
      router.push(`/lobby?room=${newRoomId}`);
    }, 800);
  };

  // LOGIC: Handle Joining a Room
  const handleJoinRoom = () => {
    if (roomCode.length !== 6) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const name = playerName.trim() || generatePlayerName();
      
      sessionStorage.setItem('playerName', name);
      sessionStorage.setItem('roomId', roomCode.toUpperCase());
      sessionStorage.setItem('isHost', 'false');
      
      router.push(`/lobby?room=${roomCode.toUpperCase()}`);
    }, 800);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#051C22] flex flex-col items-center justify-center overflow-hidden font-serif">
      


      {/* --- LAYER 1: BACKGROUND GLOW --- */}
      {/* Warm light hitting the bottom of the frame */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-[#E5B96F] opacity-15 blur-[120px] rounded-[100%] pointer-events-none" />

      {/* --- LAYER 2: ORNATE FRAME SVG --- */}
      {/* This loads your 'background.svg' and stretches it to fit */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none p-2 md:p-6"
        style={{
          backgroundImage: 'url("/background.svg")',
          backgroundSize: '100% 100%', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* --- LAYER 3: MAIN CONTENT --- */}
      <div className="relative z-20 flex flex-col items-center gap-10 w-full max-w-lg px-8">
        
        {/* GAME TITLE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 
            className="text-metallic text-6xl md:text-8xl font-bold tracking-tighter"
            style={{ 
              WebkitTextStroke: '1px rgba(229, 185, 111, 0.3)',
              filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))'
            }}
          >
            AI NEXUS
          </h1>
          <p className="text-[#E5B96F]/50 tracking-[0.3em] text-xs uppercase">
            Multimodal Game Master
          </p>
        </motion.div>

        {/* MENU AREA */}
        <div className="min-h-[300px] flex flex-col justify-center w-full items-center">
          <AnimatePresence mode="wait">
            
            {/* VIEW: MAIN MENU */}
            {view === 'main' && (
              <motion.div 
                key="main"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <GameButton onClick={() => setView('join')}>Join Game</GameButton>
                <GameButton onClick={() => setView('create')}>Create Game</GameButton>
                <GameButton onClick={() => {}}>About Game</GameButton>
              </motion.div>
            )}

            {/* VIEW: JOIN GAME INPUT */}
            {view === 'join' && (
              <motion.div 
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <h2 className="text-[#E5B96F] text-xl tracking-widest uppercase">Enter Code</h2>
                
                <input
                  autoFocus
                  className="input-glow bg-black/40 border-b-2 border-[#E5B96F]/50 text-[#E5B96F] text-center text-4xl tracking-[0.5em] w-full max-w-xs py-3 outline-none focus:border-[#E5B96F] transition-all placeholder:text-[#E5B96F]/20"
                  placeholder="XY12AB"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />

                <input
                  className="input-glow bg-black/40 border-b-2 border-[#E5B96F]/30 text-[#E5B96F] text-center text-xl tracking-widest w-full max-w-xs py-2 outline-none focus:border-[#E5B96F] transition-all placeholder:text-[#E5B96F]/20"
                  placeholder="YOUR NAME (OPTIONAL)"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />

                <div className="flex flex-col gap-3 mt-2">
                  <GameButton onClick={handleJoinRoom} isLoading={isLoading} disabled={roomCode.length !== 6}>
                    Enter Realm
                  </GameButton>
                  <button 
                    onClick={() => setView('main')}
                    className="text-[#E5B96F]/40 hover:text-[#E5B96F] text-sm tracking-widest uppercase transition-colors py-2"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW: CREATE GAME */}
            {view === 'create' && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                 <h2 className="text-[#E5B96F] text-xl tracking-widest uppercase">Host Game</h2>
                 
                 <input
                  autoFocus
                  className="input-glow bg-black/40 border-b-2 border-[#E5B96F]/50 text-[#E5B96F] text-center text-xl tracking-widest w-full max-w-xs py-2 outline-none focus:border-[#E5B96F] transition-all placeholder:text-[#E5B96F]/20"
                  placeholder="YOUR NAME"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />

                <div className="flex flex-col gap-3 mt-4">
                  <GameButton onClick={handleCreateRoom} isLoading={isLoading}>
                    Start Session
                  </GameButton>
                  <button 
                    onClick={() => setView('main')}
                    className="text-[#E5B96F]/40 hover:text-[#E5B96F] text-sm tracking-widest uppercase transition-colors py-2"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* --- LAYER 4: VIGNETTE --- */}
      {/* Darkens the corners to focus attention on the center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_#000000_120%)]" />
      
    </main>
  );
}