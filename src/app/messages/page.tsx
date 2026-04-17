
'use client';

import { useState, useEffect, useRef } from 'react';
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
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Get Friendships
  const friendshipQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'friendships'),
      where('participants', 'array-contains', user.uid)
    );
  }, [db, user]);

  const { data: friendships, isLoading: isFriendshipsLoading } = useCollection(friendshipQuery);

  // 2. Get Messages for active conversation
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

  // 3. Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 4. Load active partner data
  useEffect(() => {
    const fetchPartner = async () => {
      if (!db || !activePartnerId) return;
      const docRef = doc(db, 'public_user_profiles', activePartnerId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setActivePartner(snap.data());
    };
    fetchPartner();
  }, [db, activePartnerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !activeConversationId || !newMessage.trim() || !activePartnerId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    const msgRef = collection(db, 'messages');
    await addDoc(msgRef, {
      conversationId: activeConversationId,
      senderId: user.uid,
      receiverId: activePartnerId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isRead: false
    });

    // Update conversation metadata
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
          <Button asChild className="w-full bg-primary"><a href="/login">Get Started</a></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-16">
      <Navbar />
      <main className="max-w-6xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex bg-card border rounded-xl overflow-hidden shadow-xl mt-4 m-4">
        
        {/* Sidebar: Conversations */}
        <aside className={`w-full md:w-80 border-r flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-headline font-bold text-lg">Connections</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isFriendshipsLoading ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)
              ) : friendships?.length ? (
                friendships.map((f: any) => {
                  const partnerId = f.participants.find((p: string) => p !== user.uid);
                  return (
                    <button
                      key={f.id}
                      onClick={() => selectConversation(partnerId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-secondary ${activePartnerId === partnerId ? 'bg-secondary ring-1 ring-primary/10' : ''}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">User Profile</p>
                        <p className="text-xs text-muted-foreground truncate italic">Established Connection</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-4">
                  <MessageSquare className="w-10 h-10 mx-auto opacity-20" />
                  <p className="text-xs text-muted-foreground">Only friends can chat. Connect with others to start a conversation.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Chat Area */}
        <section className={`flex-1 flex flex-col bg-background ${!activeConversationId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!activeConversationId ? (
            <div className="text-center space-y-4 opacity-40">
              <MessageSquare className="w-20 h-20 mx-auto" />
              <p className="text-lg font-headline font-bold">Your Messages</p>
              <p className="text-sm">Select a connection to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConversationId(null)}>
                    <Send className="w-5 h-5 rotate-180" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activePartner?.profilePictureUrl} />
                    <AvatarFallback>{activePartner?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold">{activePartner?.name || 'Loading...'}</span>
                </div>
              </header>

              {/* Messages Body */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-4">
                  {messages?.map((msg: any) => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                          {msg.content}
                          <p className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-card/30 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-full bg-background border-none ring-1 ring-border"
                />
                <Button type="submit" size="icon" className="rounded-full bg-primary" disabled={!newMessage.trim()}>
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
