
'use client';

import Link from 'next/link';
import { Home, Compass, PlusSquare, User, Bell, Search, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 w-full bg-background border-b z-50 h-16 hidden md:flex items-center justify-between px-8">
        <Link href="/" className="text-2xl font-headline font-bold text-primary italic">
          EthioConnect
        </Link>
        
        <div className="flex-1 max-w-sm mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search people & businesses..."
              className="pl-8 bg-secondary/50 border-none rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-primary transition-colors"><Home className="w-6 h-6" /></Link>
          <Link href="/explore" className="hover:text-primary transition-colors"><Compass className="w-6 h-6" /></Link>
          <Link href="/business" className="hover:text-primary transition-colors"><Briefcase className="w-6 h-6" /></Link>
          <Link href="/notifications" className="hover:text-primary transition-colors"><Bell className="w-6 h-6" /></Link>
          <Link href="/profile" className="hover:text-primary transition-colors"><User className="w-6 h-6" /></Link>
          <Button variant="default" className="rounded-full bg-primary hover:bg-primary/90">
            Post
          </Button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="fixed top-0 w-full bg-background border-b z-50 h-14 flex md:hidden items-center justify-between px-4">
        <span className="text-xl font-headline font-bold text-primary italic">EthioConnect</span>
        <div className="flex gap-4">
          <Bell className="w-6 h-6" />
          <Search className="w-6 h-6" />
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 w-full bg-background border-t z-50 h-16 flex md:hidden items-center justify-around px-2">
        <Link href="/" className="p-2"><Home className="w-6 h-6" /></Link>
        <Link href="/explore" className="p-2"><Compass className="w-6 h-6" /></Link>
        <Link href="/create" className="p-2 text-primary"><PlusSquare className="w-8 h-8" /></Link>
        <Link href="/business" className="p-2"><Briefcase className="w-6 h-6" /></Link>
        <Link href="/profile" className="p-2"><User className="w-6 h-6" /></Link>
      </nav>
    </>
  );
}
