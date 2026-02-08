'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DragonFrame } from '@/components/ui/LobbyElements';
import { Crown, Swords } from 'lucide-react';
import Image from 'next/image';

interface RoleRevealProps {
  isGameMaster: boolean;
  gameMasterName: string;
}

export function RoleReveal({ isGameMaster, gameMasterName }: RoleRevealProps) {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="w-full max-w-5xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.3 }}
      >
        <DragonFrame className="min-h-[500px]">
          <div className="flex flex-col items-center justify-center w-full h-full text-center space-y-8">
            
            {/* --- ICON / ARTWORK --- */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[80px] rounded-full opacity-60",
                isGameMaster ? "bg-amber-400" : "bg-cyan-400"
              )} />

              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  filter: ['drop-shadow(0 0 10px rgba(0,0,0,0.5))', 'drop-shadow(0 0 25px rgba(255,255,255,0.2))', 'drop-shadow(0 0 10px rgba(0,0,0,0.5))']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                  {/* PIVOT: Using Icons for now, but ready for Image replacement */}
                  {/* User can replace these with <Image src="/role_reveal_gm.png" ... /> */}
                  {isGameMaster ? (
                       <Crown size={180} strokeWidth={1} className="text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                  ) : (
                       <Swords size={180} strokeWidth={1} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                  )}
              </motion.div>
            </motion.div>

            {/* --- TEXT CONTENT --- */}
            <div className="space-y-4 relative z-10">
              <motion.h1
                className={cn(
                  "text-5xl md:text-7xl font-bold tracking-widest uppercase font-serif",
                  "text-transparent bg-clip-text bg-gradient-to-b",
                  isGameMaster 
                    ? "from-[#fbbf24] to-[#b45309] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                    : "from-cyan-300 to-blue-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                )}
                style={{ WebkitTextStroke: isGameMaster ? '1px #78350f' : '1px #1e3a8a' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {isGameMaster ? 'Game Master' : 'Player'}
              </motion.h1>

              <motion.p
                className="text-[#E5B96F]/80 text-lg md:text-xl font-serif tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {isGameMaster 
                  ? "Get Ready to Describe Your Image" 
                  : "May the Best Prompt Win it All"
                }
              </motion.p>
              
              {!isGameMaster && (
                  <motion.p 
                    className="text-sm text-cyan-400/60 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    GM: {gameMasterName}
                  </motion.p>
              )}
            </div>

            {/* --- LOADING INDICATOR --- */}
            <motion.div
               className="absolute bottom-12 flex gap-2"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
            >
               {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isGameMaster ? "bg-[#fbbf24]" : "bg-cyan-400"
                  )}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
               ))}
            </motion.div>

          </div>
        </DragonFrame>
      </motion.div>
    </div>
  );
}
