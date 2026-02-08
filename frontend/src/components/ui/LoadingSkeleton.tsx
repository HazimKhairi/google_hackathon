'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'image' | 'avatar' | 'card';
}

export function LoadingSkeleton({ className, variant = 'text' }: LoadingSkeletonProps) {
  const variants = {
    text: 'h-4 w-full',
    image: 'h-48 w-full aspect-square',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full',
  };

  return (
    <motion.div
      className={cn(
        'bg-border rounded-lg overflow-hidden',
        variants[variant],
        className
      )}
      animate={{
        background: [
          'linear-gradient(90deg, #1e1e2e 0%, #2a2a3e 50%, #1e1e2e 100%)',
          'linear-gradient(90deg, #2a2a3e 0%, #1e1e2e 50%, #2a2a3e 100%)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <LoadingSkeleton variant="image" className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-text-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
