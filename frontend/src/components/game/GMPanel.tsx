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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Secret Prompt & Image */}
      <Card variant="gm">
        <CardHeader>
          <CardTitle className="text-gm flex items-center gap-2">
            <span className="text-2xl">👑</span>
            Your Secret Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Secret Prompt */}
          <div className="mb-4 p-4 bg-background rounded-lg border border-gm/30">
            <p className="text-sm text-text-secondary mb-1">The prompt is:</p>
            {prompt ? (
              <motion.p
                className="text-lg font-semibold text-gm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                "{prompt}"
              </motion.p>
            ) : (
              <div className="h-6 w-48 bg-border rounded animate-pulse" />
            )}
          </div>

          {/* Generated Image */}
          <div className="aspect-square rounded-xl overflow-hidden border border-gm/30">
            {imageUrl ? (
              <motion.img
                src={imageUrl}
                alt="AI Generated Image"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <ImageSkeleton className="w-full h-full" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description Input */}
      <Card variant="glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            Describe the Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">
            Describe the image to other players <strong>without</strong> revealing the exact prompt. 
            Be creative but fair!
          </p>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you see in the image..."
            className={cn(
              'w-full h-40 px-4 py-3 bg-background border border-border rounded-lg',
              'text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary resize-none'
            )}
            disabled={!isDescribing || isSubmitting}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {description.length} characters
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || !isDescribing || isSubmitting}
              isLoading={isSubmitting}
            >
              Send Description
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
