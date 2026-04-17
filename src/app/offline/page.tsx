
'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex flex-col items-center justify-center p-8 pt-32 text-center space-y-6">
        <div className="bg-muted p-8 rounded-full">
          <WifiOff className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">You're Offline</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            It looks like your internet connection is unavailable. Check your connection and try again.
          </p>
        </div>
        <div className="flex flex-col w-full gap-3 pt-4">
          <Button onClick={() => window.location.reload()} className="w-full bg-primary">
            Try Again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
