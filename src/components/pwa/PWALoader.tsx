
'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Progress } from '@/components/ui/progress';

export function PWALoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 transition-opacity duration-500">
      <div className="animate-bounce mb-8">
        <Logo iconClassName="w-20 h-20" showText={false} />
      </div>
      <div className="text-center space-y-4 w-full max-w-xs">
        <h2 className="text-2xl font-headline font-bold text-primary italic">F-Moon</h2>
        <Progress value={progress} className="h-1 bg-secondary" />
        <p className="text-xs text-muted-foreground animate-pulse font-medium uppercase tracking-widest">
          Connecting you to Ethiopia...
        </p>
      </div>
    </div>
  );
}
