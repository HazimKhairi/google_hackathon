'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { ImageSkeleton } from '@/components/ui/LoadingSkeleton';
import { cn } from '@/lib/utils';

interface GMPanelProps {
  prompt: string | null;
  imageUrl: string | null;
  isDescribing: boolean;
  onSubmitDescription: (description: string) => void;
}

export function GMPanel({ prompt, imageUrl, isDescribing, onSubmitDescription }: GMPanelProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    onSubmitDescription(description);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      
      {/* LEFT COLUMN: Large Image Area */}
      <Card variant="gm" className="h-[500px] lg:h-auto flex flex-col p-1">
          <div className="w-full h-full rounded-lg overflow-hidden border border-gm/30 bg-black/40 relative group">
            {imageUrl ? (
              <motion.img
                src={imageUrl}
                alt="AI Generated Image"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
                    <ImageSkeleton className="w-[80%] h-[80%]" />
                </div>
            )}
             
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white/60 text-xs uppercase tracking-widest text-center">
                    AI Generated Representation
                </p>
             </div>
          </div>
      </Card>


      {/* RIGHT COLUMN: Stacked Bento Grid */}
      <div className="flex flex-col gap-6 h-full">
        
        {/* TOP RIGHT: Secret Prompt (Approx 1/3 height) */}
        <Card variant="gm" className="flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gm/5 pointer-events-none" />
            <CardHeader className="pb-2">
            <CardTitle className="text-gm flex items-center gap-2 text-lg">
                <span>👑</span>
                Your Secret PromptWrapper
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="p-4 bg-black/40 rounded-lg border border-gm/20 flex flex-col justify-center min-h-[100px]">
                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider">You must help others guess this:</p>
                {prompt ? (
                <motion.p
                    className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    "{prompt}"
                </motion.p>
                ) : (
                <div className="h-8 w-3/4 bg-border/50 rounded animate-pulse" />
                )}
            </div>
            </CardContent>
        </Card>

        {/* BOTTOM RIGHT: Description Input (Approx 2/3 height) */}
        <Card variant="glow" className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
                <span>🎭</span>
                Describe the Image
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
            <p className="text-sm text-text-secondary">
                Describe visual details without revealing the exact words. 
                <span className="block text-xs text-text-muted mt-1 opacity-70">Example: "A futuristic metropolis in the clouds with golden towers."</span>
            </p>
            
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type your description here..."
                className={cn(
                'w-full flex-1 min-h-[120px] p-4 bg-black/40 border border-border/50 rounded-lg',
                'text-text-primary placeholder:text-text-muted/50 text-lg leading-relaxed',
                'focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all'
                )}
                disabled={!isDescribing || isSubmitting}
            />

            <div className="flex items-center justify-between pt-2">
                <span className={cn(
                    "text-xs transition-colors",
                    description.length > 100 ? "text-emerald-400" : "text-text-muted"
                )}>
                {description.length} chars
                </span>
                <Button
                onClick={handleSubmit}
                disabled={!description.trim() || !isDescribing || isSubmitting}
                isLoading={isSubmitting}
                className="w-[200px]"
                >
                Send Description
                </Button>
            </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
