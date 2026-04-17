'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileHoverCard } from '@/components/profile/ProfileHoverCard';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, increment, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PostCardProps {
  post: any;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Check if user liked this post
  const likeRef = useMemoFirebase(() => {
    if (!db || !user || !post.id) return null;
    return doc(db, 'post_likes', `${post.id}_${user.uid}`);
  }, [db, user, post.id]);

  const { data: likeData } = useDoc(likeRef);
  const isLiked = !!likeData;

  // Check if user bookmarked this post
  const bookmarkRef = useMemoFirebase(() => {
    if (!db || !user || !post.id) return null;
    return doc(db, 'bookmarks', `${post.id}_${user.uid}`);
  }, [db, user, post.id]);

  const { data: bookmarkData } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmarkData;

  const handleLike = () => {
    if (!db || !user) {
      toast({ title: "Auth Required", description: "Please log in to like posts." });
      return;
    }
    
    const postRef = doc(db, 'posts', post.id);
    
    if (isLiked) {
      deleteDocumentNonBlocking(likeRef!);
      updateDocumentNonBlocking(postRef, { likesCount: increment(-1) });
    } else {
      setDocumentNonBlocking(likeRef!, {
        postId: post.id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      updateDocumentNonBlocking(postRef, { likesCount: increment(1) });
      
      // Notify author
      if (post.authorId !== user.uid) {
        addDocumentNonBlocking(collection(db, 'notifications'), {
          recipientId: post.authorId,
          actorId: user.uid,
          actorName: user.displayName || 'Someone',
          actorAvatar: user.photoURL || '',
          type: 'like',
          message: 'liked your post',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  };

  const handleBookmark = () => {
    if (!db || !user) {
      toast({ title: "Auth Required", description: "Please log in to save posts." });
      return;
    }
    
    if (isBookmarked) {
      deleteDocumentNonBlocking(bookmarkRef!);
      toast({ title: "Removed from Saved" });
    } else {
      setDocumentNonBlocking(bookmarkRef!, {
        postId: post.id,
        userId: user.uid,
        postData: post,
        createdAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Saved to Bookmarks" });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on F-Moon',
          text: post.content,
          url: url,
        });
        return;
      } catch (err) {
        // Fall back to clipboard copy if share is denied or fails
      }
    }
    
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link Copied", description: "Share it with your friends!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" });
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto border-none shadow-none md:border md:shadow-sm mb-6 rounded-none md:rounded-lg overflow-hidden bg-card transition-all">
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <ProfileHoverCard id={post.authorId} type="user" initialData={{ name: post.userName, avatar: post.userAvatar }}>
            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
              <AvatarImage src={post.userAvatar} />
              <AvatarFallback>{post.userName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </ProfileHoverCard>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <ProfileHoverCard id={post.authorId} type="user" initialData={{ name: post.userName, avatar: post.userAvatar }}>
                <span className="text-sm font-semibold hover:underline cursor-pointer">{post.userName}</span>
              </ProfileHoverCard>
              {post.isPromoted && (
                <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <Link href={`/post/${post.id}`}>
          {post.videoUrl ? (
            <div className="relative aspect-square w-full bg-black">
              <video 
                src={post.videoUrl} 
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            </div>
          ) : post.imageUrl ? (
            <div className="relative aspect-square w-full">
              <Image
                src={post.imageUrl}
                alt="Post content"
                fill
                className="object-cover"
                priority={priority}
                unoptimized={post.imageUrl.startsWith('data:')}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          ) : (
             <div className="p-6 text-lg font-medium bg-muted/30 italic">
               "{post.content}"
             </div>
          )}
        </Link>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike} 
                className={cn("transition-all active:scale-125", isLiked ? "text-accent" : "hover:opacity-60")}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              </button>
              <Link href={`/post/${post.id}`} className="hover:opacity-60 transition-opacity">
                <MessageCircle className="w-6 h-6" />
              </Link>
              <button onClick={handleShare} className="hover:opacity-60 transition-opacity">
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button 
              onClick={handleBookmark} 
              className={cn("transition-all active:scale-125", isBookmarked ? "text-primary" : "hover:opacity-60")}
            >
              <Bookmark className={cn("w-6 h-6", isBookmarked && "fill-current")} />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{(post.likesCount || 0).toLocaleString()} likes</p>
            <div className="text-sm leading-relaxed">
              <span className="font-bold mr-2">{post.userName}</span>
              {post.content}
            </div>
            <Link href={`/post/${post.id}`} className="text-xs text-muted-foreground mt-1 hover:underline block">
              View all {post.commentsCount || 0} comments
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}