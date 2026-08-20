import React from 'react';
import { Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  title: string, 
  description: string, 
  actionLabel?: string, 
  onAction?: () => void 
}) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Ghost className="w-8 h-8 text-muted-foreground opacity-50" />
      </div>
      <h3 className="font-heading text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground font-sans max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
