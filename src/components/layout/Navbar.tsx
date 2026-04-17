
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Compass, PlusSquare, User, Bell, Search, Briefcase, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/Logo';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { collection, query, where } from 'firebase/firestore';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time unread notification check
  const unreadNotifsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'notifications'), where('recipientId', '==', user.uid), where('read', '==', false));
  }, [db, user]);
  const { data: unreadNotifs } = useCollection(unreadNotifsQuery);
  const hasUnreadNotifs = mounted && (unreadNotifs?.length || 0) > 0;

  // Real-time unread messages check
  const unreadMessagesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'messages'), where('receiverId', '==', user.uid), where('isRead', '==', false));
  }, [db, user]);
  const { data: unreadMessages } = useCollection(unreadMessagesQuery);
  const hasUnreadMessages = mounted && (unreadMessages?.length || 0) > 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const onSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50 h-16 hidden md:flex items-center justify-between px-8">
        <Link href="/">
          <Logo />
        </Link>
        
        <form onSubmit={onSearchSubmit} className="flex-1 max-w-sm mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search F-Moon..."
              className="pl-10 bg-secondary/50 border-none rounded-full h-9 focus-visible:ring-1 focus-visible:ring-primary"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={onSearchSubmit}
            />
          </div>
        </form>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors" title="Home">
            <Home className="w-6 h-6" />
          </Link>
          <Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors" title="Explore">
            <Compass className="w-6 h-6" />
          </Link>
          <Link 
            href="/messages" 
            className="text-muted-foreground hover:text-primary transition-colors relative" 
            title="Messages"
          >
            <MessageSquare className="w-6 h-6" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
            )}
          </Link>
          <Link href="/business/dashboard" className="text-muted-foreground hover:text-primary transition-colors" title="Business Hub">
            <Briefcase className="w-6 h-6" />
          </Link>
          <Link 
            href="/notifications" 
            className="text-muted-foreground hover:text-primary transition-colors relative" 
            title="Notifications"
          >
            <Bell className="w-6 h-6" />
            {hasUnreadNotifs && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse" />
            )}
          </Link>
          <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors" title="My Profile">
            <User className="w-6 h-6" />
          </Link>
          <div className="h-6 w-px bg-border mx-2" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <Button variant="default" className="rounded-full bg-primary hover:bg-primary/90 px-6 h-9 font-bold" asChild>
            <Link href="/create">Post</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50 h-14 flex md:hidden items-center justify-between px-4">
        <Link href="/">
          <Logo iconClassName="w-8 h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/explore">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/messages" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MessageSquare className="w-5 h-5" />
            </Button>
            {hasUnreadMessages && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 w-full bg-background/95 backdrop-blur-md border-t z-50 h-16 flex md:hidden items-center justify-around px-2 pb-safe">
        <Link href="/" className="p-2 text-muted-foreground active:text-primary transition-colors">
          <Home className="w-6 h-6" />
        </Link>
        <Link href="/explore" className="p-2 text-muted-foreground active:text-primary transition-colors">
          <Compass className="w-6 h-6" />
        </Link>
        <Link href="/create" className="p-2 flex items-center justify-center">
          <div className="bg-primary p-2 rounded-xl shadow-lg transform active:scale-95 transition-transform">
            <PlusSquare className="w-6 h-6 text-white" />
          </div>
        </Link>
        <Link href="/notifications" className="p-2 text-muted-foreground active:text-primary transition-colors relative">
          <Bell className="w-6 h-6" />
          {hasUnreadNotifs && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse" />
          )}
        </Link>
        <Link href="/profile" className="p-2 text-muted-foreground active:text-primary transition-colors">
          <User className="w-6 h-6" />
        </Link>
      </nav>
    </>
  );
}
