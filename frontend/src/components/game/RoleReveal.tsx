'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RoleRevealProps {
  isGameMaster: boolean;
  gameMasterName: string;
}

export function RoleReveal({ isGameMaster, gameMasterName }: RoleRevealProps) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {/* Crown Animation */}
        <motion.div
          className="text-8xl mb-6"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          👑
        </motion.div>

        {isGameMaster ? (
          <>
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gm mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              You are the Game Master!
            </motion.h1>
            <motion.p
              className="text-xl text-text-secondary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Get ready to describe your image...
            </motion.p>
          </>
        ) : (
          <>
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-primary mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {gameMasterName} is the Game Master
            </motion.h1>
            <motion.p
              className="text-xl text-text-secondary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Get ready to guess the prompt...
            </motion.p>
          </>
        )}

        {/* Loading indicator */}
        <motion.div
          className="mt-8 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full',
                isGameMaster ? 'bg-gm' : 'bg-primary'
              )}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
