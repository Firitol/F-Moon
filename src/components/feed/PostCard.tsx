'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileHoverCard } from '@/components/profile/ProfileHoverCard';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
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

  const handleLike = async () => {
    if (!db || !user) {
      toast({ title: "Auth Required", description: "Please log in to like posts." });
      return;
    }
    setIsLiking(true);
    try {
      const postRef = doc(db, 'posts', post.id);
      if (isLiked) {
        await deleteDoc(likeRef!);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef!, {
          postId: post.id,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        await updateDoc(postRef, { likesCount: increment(1) });
        
        // Notify author
        if (post.authorId !== user.uid) {
          await setDoc(doc(collection(db, 'notifications')), {
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
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!db || !user) {
      toast({ title: "Auth Required", description: "Please log in to save posts." });
      return;
    }
    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await deleteDoc(bookmarkRef!);
        toast({ title: "Removed from Saved" });
      } else {
        await setDoc(bookmarkRef!, {
          postId: post.id,
          userId: user.uid,
          postData: post, // Cache post data for the saved tab
          createdAt: new Date().toISOString()
        });
        toast({ title: "Saved to Bookmarks" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on F-Moon',
          text: post.content,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link Copied", description: "Share it with your friends!" });
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto border-none shadow-none md:border md:shadow-sm mb-6 rounded-none md:rounded-lg overflow-hidden bg-card">
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
        {post.videoUrl ? (
          <div className="relative aspect-square w-full bg-black">
            <video 
              src={post.videoUrl} 
              controls 
              className="w-full h-full object-cover"
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
        ) : null}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike} 
                disabled={isLiking}
                className={cn("transition-all active:scale-125", isLiked ? "text-accent" : "hover:opacity-60")}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              </button>
              <button className="hover:opacity-60 transition-opacity">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button onClick={handleShare} className="hover:opacity-60 transition-opacity">
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button 
              onClick={handleBookmark} 
              disabled={isBookmarking}
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
            <button className="text-xs text-muted-foreground mt-1 hover:underline">
              View all {post.commentsCount || 0} comments
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
