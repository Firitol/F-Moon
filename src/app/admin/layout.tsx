
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  AlertTriangle, 
  CreditCard,
  ChevronLeft,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'admin_roles', user.uid);
  }, [db, user]);

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminRoleRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // If we've finished checking and the user isn't an admin, send them home
    if (!isAdminLoading && !isUserLoading && user && !adminRole) {
      router.push('/');
    }
  }, [adminRole, isAdminLoading, isUserLoading, user, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const sidebarItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Businesses', href: '/admin/businesses', icon: Briefcase },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Reports', href: '/admin/reports', icon: AlertTriangle },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  ];

  if (isUserLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-48 mx-auto" />
          <p className="text-muted-foreground animate-pulse">Verifying administrative privileges...</p>
        </div>
      </div>
    );
  }

  // Final check to prevent content flash for non-admins
  if (!adminRole) return null;

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-headline font-bold text-xl text-primary">Admin Panel</span>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
            <Link href="/">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-card border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-headline font-bold text-lg">
            {sidebarItems.find(i => i.href === pathname)?.name || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user?.displayName || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {user?.displayName?.[0] || 'A'}
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
