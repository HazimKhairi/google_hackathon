'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'gm';
  animate?: boolean;
}

export function Card({ children, className, variant = 'default', animate = true }: CardProps) {
  const variants = {
    default: 'bg-surface border-border',
    glow: 'bg-surface border-primary/50 shadow-lg shadow-primary/10',
    gm: 'bg-surface border-gm/50 shadow-lg shadow-gm/10',
  };

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Component
      className={cn(
        'rounded-xl border p-6',
        variants[variant],
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-bold text-text-primary', className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-text-secondary', className)}>
      {children}
    </div>
  );
}
