
'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function Logo({ className, iconClassName, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "bg-primary rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105",
        iconClassName || "w-10 h-10"
      )}>
        <Share2 className="text-white w-2/3 h-2/3" />
      </div>
      {showText && (
        <span className="font-headline font-bold text-xl text-primary tracking-tighter italic">
          EthioConnect
        </span>
      )}
    </div>
  );
}
