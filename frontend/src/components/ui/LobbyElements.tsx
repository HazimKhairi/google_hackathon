'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { User, UserPlus } from 'lucide-react';

/**
 * DragonFrame: The main container with dragon border SVG.
 * Uses the new dragon_border2.svg which has built-in transparency.
 */
export const DragonFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative w-full max-w-7xl flex items-center justify-center", className)}>
    
    {/* 1. LAYER: Dark background that shows through the transparent SVG center */}
    <div className="absolute inset-[6%] bg-gradient-to-br from-[#0A2830] via-[#072028] to-[#051820] rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
    
    {/* 2. LAYER: The Dragon Border SVG (transparent center) */}
    <div 
      className="relative w-full pointer-events-none"
      style={{ 
        backgroundImage: 'url("/dragon_border2.svg")',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        aspectRatio: '16/9',
      }}
    >
      {/* 3. LAYER: Subtle golden inner border glow */}
      <div className="absolute inset-[8%] rounded-lg border border-[#E5B96F]/20 pointer-events-none" />
      
      {/* 4. LAYER: Content Container */}
      <div className="relative z-10 w-full h-full flex gap-5 px-[14%] py-[12%]">
        {children}
      </div>
    </div>
  </div>
);

interface PlayerBadgeProps {
  name: string;
  status: 'ready' | 'not-ready' | 'waiting';
  isCurrentUser?: boolean;
}

export const PlayerBadge = ({ name, status, isCurrentUser }: PlayerBadgeProps) => {
  const statusConfig = {
    'ready': { color: 'bg-emerald-500', text: 'Ready', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]', ring: 'ring-emerald-500/50' },
    'not-ready': { color: 'bg-amber-500', text: 'Not Ready', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]', ring: 'ring-amber-500/50' },
    'waiting': { color: 'bg-slate-500', text: 'Waiting...', glow: 'shadow-none', ring: 'ring-slate-500/30' }
  };

  const currentStatus = statusConfig[status];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="relative">
        {/* Glow effect behind avatar */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-md transition-all duration-300",
          isCurrentUser ? "bg-[#E5B96F]/40" : "bg-[#E5B96F]/20",
          "group-hover:bg-[#E5B96F]/50"
        )} />
        
        {/* Avatar Circle */}
        <div className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#0A2A35] to-[#051C22] border-2 flex items-center justify-center shadow-xl z-10 relative group-hover:scale-110 transition-all duration-300",
          isCurrentUser ? "border-[#E5B96F] ring-2 ring-[#E5B96F]/30" : "border-[#E5B96F]/60"
        )}>
           <User className={cn(
             "w-5 h-5 md:w-6 md:h-6 transition-colors",
             isCurrentUser ? "text-[#E5B96F]" : "text-[#E5B96F]/70"
           )} />
        </div>
        
        {/* Status indicator dot */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A2A35] z-20",
          currentStatus.color,
          currentStatus.glow
        )} />
      </div>

      <div className="text-center space-y-0.5">
        <p className={cn(
            "font-serif text-[9px] md:text-[10px] uppercase tracking-wider font-bold max-w-[70px] truncate transition-colors", 
            isCurrentUser ? "text-[#E5B96F]" : "text-[#E5B96F]/70 group-hover:text-[#E5B96F]"
        )}>
          {name}
          {isCurrentUser && <span className="text-[7px] opacity-50 ml-1">(You)</span>}
        </p>
        <span className={cn(
          "px-1.5 py-0.5 rounded-full text-[7px] uppercase font-bold tracking-wider block mx-auto w-fit transition-all",
          currentStatus.color,
          currentStatus.glow,
          "text-white"
        )}>
          {currentStatus.text}
        </span>
      </div>
    </motion.div>
  );
};

/** Empty player slot with animated dashed border */
export const EmptyPlayerSlot = ({ index }: { index: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
    className="flex flex-col items-center gap-2 group cursor-pointer"
  >
    <div className="relative">
      {/* Pulsing glow on hover */}
      <div className="absolute inset-0 rounded-full bg-[#E5B96F]/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Dashed circle with animated border */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dashed border-[#E5B96F]/30 flex items-center justify-center bg-[#051C22]/30 group-hover:border-[#E5B96F]/50 group-hover:bg-[#051C22]/50 transition-all duration-300 relative">
        <UserPlus className="w-4 h-4 text-[#E5B96F]/30 group-hover:text-[#E5B96F]/60 transition-colors" />
        
        {/* Spinning dashed outer ring */}
        <div className="absolute inset-[-3px] rounded-full border border-[#E5B96F]/20 border-dashed animate-[spin_15s_linear_infinite]" />
      </div>
    </div>

    <div className="text-center space-y-0.5">
      <p className="font-serif text-[9px] md:text-[10px] uppercase tracking-wider text-[#E5B96F]/30 group-hover:text-[#E5B96F]/50 transition-colors">
        Empty
      </p>
      <span className="px-1.5 py-0.5 rounded-full text-[7px] uppercase font-bold tracking-wider bg-[#E5B96F]/10 text-[#E5B96F]/40 block mx-auto w-fit">
        Invite
      </span>
    </div>
  </motion.div>
);

export const LobbyPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "bg-gradient-to-b from-[#051C22]/80 to-[#031318]/90 rounded-lg p-3 md:p-4 flex flex-col gap-2 border border-[#E5B96F]/25 shadow-2xl backdrop-blur-sm",
    "shadow-[inset_0_1px_0_rgba(229,185,111,0.1),_0_8px_32px_rgba(0,0,0,0.4)]",
    className
  )}>
    {children}
  </div>
);

/** Section header for lobby panels */
export const PanelHeader = ({ children, badge }: { children: React.ReactNode; badge?: React.ReactNode }) => (
  <div className="flex justify-between items-center pb-1.5 border-b border-[#E5B96F]/15">
    <h3 className="text-[#E5B96F]/80 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold">
      {children}
    </h3>
    {badge}
  </div>
);