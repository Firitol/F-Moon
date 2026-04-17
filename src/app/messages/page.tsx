'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  doc, 
  getDoc,
  setDoc
} from 'firebase/firestore';
import { Card, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, ShieldAlert, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

function MessagesContent() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const partnerParam = searchParams.get('partner');

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle auto-selection from URL
  useEffect(() => {
    if (partnerParam && user) {
      const convId = [user.uid, partnerParam].sort().join('_');
      setActiveConversationId(convId);
      setActivePartnerId(partnerParam);
    }
  }, [partnerParam, user]);

  const friendshipQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'friendships'),
      where('participants', 'array-contains', user.uid)
    );
  }, [db, user]);

  const { data: friendships, isLoading: isFriendshipsLoading } = useCollection(friendshipQuery);

  const messageQuery = useMemoFirebase(() => {
    if (!db || !activeConversationId) return null;
    return query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConversationId),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
  }, [db, activeConversationId]);

  const { data: messages } = useCollection(messageQuery);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!db || !activePartnerId) return;
      const docRef = doc(db, 'public_user_profiles', activePartnerId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setActivePartner(snap.data());
      } else {
        // Check businesses if not a user
        const bizSnap = await getDoc(doc(db, 'businesses', activePartnerId));
        if (bizSnap.exists()) setActivePartner(bizSnap.data());
      }
    };
    fetchPartner();
  }, [db, activePartnerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !activeConversationId || !newMessage.trim() || !activePartnerId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    await addDoc(collection(db, 'messages'), {
      conversationId: activeConversationId,
      senderId: user.uid,
      receiverId: activePartnerId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isRead: false
    });

    const convRef = doc(db, 'conversations', activeConversationId);
    await setDoc(convRef, {
      lastMessage: messageContent,
      lastMessageAt: new Date().toISOString(),
      participants: [user.uid, activePartnerId]
    }, { merge: true });
  };

  const selectConversation = (partnerId: string) => {
    if (!user) return;
    const conversationId = [user.uid, partnerId].sort().join('_');
    setActiveConversationId(conversationId);
    setActivePartnerId(partnerId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center p-8 space-y-4">
          <ShieldAlert className="w-12 h-12 mx-auto text-primary" />
          <CardTitle>Sign in to Chat</CardTitle>
          <Button asChild className="w-full bg-primary"><Link href="/login">Get Started</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-16 bg-secondary/10">
      <Navbar />
      <main className="max-w-6xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex bg-card border rounded-none md:rounded-xl overflow-hidden shadow-xl mt-0 md:mt-4">
        
        <aside className={`w-full md:w-80 border-r flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-headline font-bold text-lg">Messages</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isFriendshipsLoading ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg m-2" />)
              ) : friendships?.length ? (
                friendships.map((f: any) => {
                  const partnerId = f.participants.find((p: string) => p !== user.uid);
                  const isSelected = activePartnerId === partnerId;
                  return (
                    <button
                      key={f.id}
                      onClick={() => selectConversation(partnerId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary ${isSelected ? 'bg-secondary ring-1 ring-primary/20 shadow-sm' : ''}`}
                    >
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-sm truncate ${isSelected ? 'font-bold text-primary' : 'font-semibold'}`}>
                          Chat Partner
                        </p>
                        <p className="text-xs text-muted-foreground truncate">established connection</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Start a conversation with friends or businesses you follow.
                  </p>
                  <Button variant="outline" size="sm" asChild className="rounded-full">
                    <Link href="/explore">Discover People</Link>
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        <section className={`flex-1 flex flex-col bg-background ${!activeConversationId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!activeConversationId ? (
            <div className="text-center space-y-4 opacity-40">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-12 h-12" />
              </div>
              <p className="text-xl font-headline font-bold">Your Conversations</p>
            </div>
          ) : (
            <>
              <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveConversationId(null)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={activePartner?.profilePictureUrl || activePartner?.imageUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {activePartner?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-none">{activePartner?.name || 'Loading...'}</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Real-time</span>
                  </div>
                </div>
              </header>

              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-4">
                  {messages?.map((msg: any) => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                          isMe 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-muted rounded-bl-none border border-border/50'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1 opacity-60 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                            {mounted && msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Sending...'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t bg-card/50 backdrop-blur flex gap-3 items-center">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-full bg-background h-11"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full bg-primary h-11 w-11 shrink-0 shadow-md" 
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse">Initializing Chat...</div>}>
      <MessagesContent />
    </Suspense>
  );
}