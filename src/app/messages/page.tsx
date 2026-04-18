'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  addDocumentNonBlocking, 
  setDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc,
} from 'firebase/firestore';
import { Card, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, ShieldAlert, ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function ConversationItem({ conversation, currentUser, activePartnerId, onSelect }: { 
  conversation: any, 
  currentUser: any, 
  activePartnerId: string | null,
  onSelect: (id: string) => void 
}) {
  const db = useFirestore();
  const partnerId = conversation.participants.find((p: string) => p !== currentUser.uid);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchPartner() {
      if (!db || !partnerId) return;
      try {
        const userRef = doc(db, 'public_user_profiles', partnerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setPartner(userSnap.data());
        } else {
          const bizRef = doc(db, 'businesses', partnerId);
          const bizSnap = await getDoc(bizRef);
          if (bizSnap.exists()) setPartner(bizSnap.data());
        }
      } catch (err) {
        console.warn('Failed to fetch partner info', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPartner();
  }, [db, partnerId]);

  const isSelected = activePartnerId === partnerId;

  if (loading) return <div className="h-16 bg-muted/20 animate-pulse rounded-lg m-1" />;

  return (
    <button
      onClick={() => onSelect(partnerId!)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary ${isSelected ? 'bg-secondary ring-1 ring-primary/20 shadow-sm' : ''}`}
    >
      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
        <AvatarImage src={partner?.profilePictureUrl || partner?.imageUrl} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
          {partner?.name?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="text-left flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <p className={`text-sm truncate ${isSelected ? 'font-bold text-primary' : 'font-semibold'}`}>
            {partner?.name || 'User'}
          </p>
          <span className="text-[8px] text-muted-foreground whitespace-nowrap">
            {mounted && conversation.lastMessageAt ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false }) : ''}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          {conversation.lastMessage || 'Start a conversation'}
        </p>
      </div>
    </button>
  );
}

function MessagesContent() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
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

  useEffect(() => {
    if (partnerParam && user) {
      const convId = [user.uid, partnerParam].sort().join('_');
      setActiveConversationId(convId);
      setActivePartnerId(partnerParam);
    }
  }, [partnerParam, user]);

  const convQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
  }, [db, user]);

  const { data: rawConversations, isLoading: isConversationsLoading } = useCollection(convQuery);

  const conversations = useMemo(() => {
    if (!rawConversations) return [];
    return [...rawConversations].sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [rawConversations]);

  const messageQuery = useMemoFirebase(() => {
    if (!db || !activeConversationId) return null;
    return query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConversationId)
    );
  }, [db, activeConversationId]);

  const { data: rawMessages } = useCollection(messageQuery);

  const messages = useMemo(() => {
    if (!rawMessages) return [];
    return [...rawMessages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }, [rawMessages]);

  useEffect(() => {
    if (messages.length > 0 && user && db) {
      messages.forEach(msg => {
        if (msg.receiverId === user.uid && !msg.isRead) {
          updateDocumentNonBlocking(doc(db, 'messages', msg.id), { isRead: true });
        }
      });
    }
  }, [messages, user, db]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
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
        const bizSnap = await getDoc(doc(db, 'businesses', activePartnerId));
        if (bizSnap.exists()) setActivePartner(bizSnap.data());
      }
    };
    fetchPartner();
  }, [db, activePartnerId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !activeConversationId || !newMessage.trim() || !activePartnerId) return;

    const messageContent = newMessage.trim();
    const timestamp = new Date().toISOString();
    setNewMessage('');

    const convRef = doc(db, 'conversations', activeConversationId);
    setDocumentNonBlocking(convRef, {
      lastMessage: messageContent,
      lastMessageAt: timestamp,
      participants: [user.uid, activePartnerId],
      updatedAt: timestamp
    }, { merge: true });

    addDocumentNonBlocking(collection(db, 'messages'), {
      conversationId: activeConversationId,
      senderId: user.uid,
      receiverId: activePartnerId,
      content: messageContent,
      createdAt: timestamp,
      isRead: false
    });

    addDocumentNonBlocking(collection(db, 'notifications'), {
      recipientId: activePartnerId,
      actorId: user.uid,
      actorName: user.displayName || 'Someone',
      actorAvatar: user.photoURL || '',
      type: 'message',
      message: 'sent you a new message',
      read: false,
      createdAt: timestamp
    });
  };

  const selectConversation = (partnerId: string) => {
    if (!user) return;
    const conversationId = [user.uid, partnerId].sort().join('_');
    setActiveConversationId(conversationId);
    setActivePartnerId(partnerId);
  };

  const handleDeleteConversation = () => {
    if (!db || !activeConversationId) return;
    deleteDocumentNonBlocking(doc(db, 'conversations', activeConversationId));
    setActiveConversationId(null);
    setActivePartnerId(null);
    toast({ title: "Conversation Deleted" });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center p-8 space-y-4 shadow-xl border-none">
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
        <aside className={`w-full md:w-80 border-r flex flex-col ${activeConversationId && mounted && typeof window !== 'undefined' && window.innerWidth < 768 ? 'hidden' : 'flex'}`}>
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-headline font-bold text-lg">Messages</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isConversationsLoading ? (
                <div className="p-4 space-y-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-lg" />)}
                </div>
              ) : conversations?.length ? (
                conversations.map((c: any) => (
                  <ConversationItem 
                    key={c.id} 
                    conversation={c} 
                    currentUser={user} 
                    activePartnerId={activePartnerId}
                    onSelect={selectConversation}
                  />
                ))
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No active conversations. Visit a profile to start a chat.
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
              <p className="text-xl font-headline font-bold">Select a conversation</p>
            </div>
          ) : (
            <>
              <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => { setActiveConversationId(null); setActivePartnerId(null); }}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="h-9 w-9 border shadow-sm">
                    <AvatarImage src={activePartner?.profilePictureUrl || activePartner?.imageUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {activePartner?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-none">{activePartner?.name || 'Loading...'}</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Active Now</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDeleteConversation}>
                  <Trash2 className="w-4 h-4" />
                </Button>
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
                            {mounted && msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : '...'}
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
                  className="rounded-full bg-background h-11 border-none ring-1 ring-border focus-visible:ring-primary"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full bg-primary h-11 w-11 shrink-0 shadow-lg active:scale-95 transition-transform" 
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
    <Suspense fallback={<div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-sm font-medium">Loading Chat...</span>
    </div>}>
      <MessagesContent />
    </Suspense>
  );
}