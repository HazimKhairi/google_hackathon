'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

export const GameButton = ({ onClick, children, disabled, isLoading }: GameButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={
        "relative group w-[320px] h-[75px] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed " +
        // Container Styles (Glass Effect + Rounded Corners + Shadows)
        "rounded-[9px] bg-black/5 " + // rgba(0, 0, 0, 0.06) is approx bg-black/5
        "shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_9px_4px_rgba(0,0,0,0.25)] " + // Combined inset and drop shadow
        "backdrop-blur-[2px]" // Optional: adding slight blur for better glass feel, though not strictly in snippet it helps "glass"
      }
    >
      {/* Button Background Image - Restored */}
      <div
        className="absolute inset-0 z-0 transition-all duration-300 group-hover:brightness-125"
        style={{
          backgroundImage: 'url("/button_border.svg")',
          backgroundSize: '100% 100%', // Use 100% 100% to fill the rounded container
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Button Text */}
      <span
        className="relative z-10 font-serif text-2xl uppercase tracking-[0.1em] select-none flex items-center gap-2 text-metallic font-bold"
        style={{
          // Font settings matching Figma (approximate) - keeping font stack
          fontFamily: '"Kreon", serif',
          textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};