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
      className="relative group w-[320px] h-[75px] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Button Background Image */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-300 group-hover:brightness-125"
        style={{ 
          backgroundImage: 'url("/button_border.svg")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Button Text */}
      <span className="relative z-10 font-serif text-[#E5B96F] text-lg uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none">
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};