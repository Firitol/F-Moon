
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, increment } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/feed/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const postRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'posts', id);
  }, [db, id]);

  const { data: post, isLoading: isPostLoading } = useDoc(postRef);

  const commentsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'comments'),
      where('postId', '==', id)
    );
  }, [db, id]);

  const { data: rawComments, isLoading: isCommentsLoading } = useCollection(commentsQuery);

  const comments = useMemo(() => {
    if (!rawComments) return [];
    return [...rawComments].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [rawComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Auth Required", description: "Please sign in to comment.", variant: "destructive" });
      return;
    }
    if (!db || !id || !newComment.trim()) return;

    setIsSubmitting(true);
    
    try {
      addDocumentNonBlocking(collection(db, 'comments'), {
        postId: id,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        authorAvatar: currentUser.photoURL || '',
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      });

      updateDocumentNonBlocking(doc(db, 'posts', id), {
        commentsCount: increment(1)
      });

      if (post && post.authorId !== currentUser.uid) {
        addDocumentNonBlocking(collection(db, 'notifications'), {
          recipientId: post.authorId,
          actorId: currentUser.uid,
          actorName: currentUser.displayName || 'Someone',
          actorAvatar: currentUser.photoURL || '',
          type: 'comment',
          message: 'commented on your post',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      setNewComment('');
      toast({ title: "Comment added!" });
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPostLoading) return <div className="p-20 text-center animate-pulse">Loading Post...</div>;

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto p-8 text-center mt-20">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <Button variant="link" asChild className="mt-4"><a href="/">Back to Feed</a></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-16 bg-secondary/10">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-4">
        <div className="space-y-4">
          <PostCard post={post} priority={true} />
        </div>

        <Card className="h-[600px] flex flex-col border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-card">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Comments ({(post.commentsCount || 0).toLocaleString()})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
            {isCommentsLoading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
               </div>
            ) : comments.length ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                      <p className="text-sm font-bold">{comment.authorName}</p>
                      <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold pl-2">
                      {mounted && comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                <MessageSquare className="w-12 h-12" />
                <p>No comments yet. Be the first!</p>
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t bg-card/50 backdrop-blur">
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input 
                placeholder={currentUser ? "Write a comment..." : "Log in to comment"} 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!currentUser || isSubmitting}
                className="rounded-full bg-background"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full shrink-0" 
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}
