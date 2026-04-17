
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useUser, useCollection, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, UserPlus, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

  useEffect(() => {
    if (notifications && db && user) {
      notifications.forEach(notif => {
        if (!notif.read) {
          updateDocumentNonBlocking(doc(db, 'notifications', notif.id), { read: true });
        }
      });
    }
  }, [notifications, db, user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-accent fill-accent" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-primary fill-primary" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'friend_request': return <UserPlus className="w-4 h-4 text-orange-500" />;
      case 'friend_accept': return <UserPlus className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-headline font-bold">Notifications</h1>
        
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
          ) : notifications?.length ? (
            notifications.map((notif) => (
              <Card key={notif.id} className={`border-none shadow-sm hover:bg-muted/30 transition-colors ${notif.read ? 'opacity-70' : 'bg-primary/5 ring-1 ring-primary/10'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-background">
                      <AvatarImage src={notif.actorAvatar} />
                      <AvatarFallback>{notif.actorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full shadow-sm ring-1 ring-border">
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-bold">{notif.actorName}</span>{' '}
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                      {mounted && notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No new notifications.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
