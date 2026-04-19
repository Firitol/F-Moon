
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck, Pencil, Trash2, Archive, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileHoverCard } from '@/components/profile/ProfileHoverCard';
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useMemoFirebase, 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  addDocumentNonBlocking 
} from '@/firebase';
import { doc, increment, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PostCardProps {
  post: any;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const likeRef = useMemoFirebase(() => {
    if (!db || !user || !post.id) return null;
    return doc(db, 'post_likes', `${post.id}_${user.uid}`);
  }, [db, user, post.id]);

  const { data: likeData } = useDoc(likeRef);
  const isLiked = !!likeData;

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
        postData: {
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl || '',
          videoUrl: post.videoUrl || '',
          userName: post.userName
        },
        createdAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Saved to Bookmarks" });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'F-Moon Ethiopia', text: post.content, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link Copied" });
      }
    } catch (err) {
      navigator.clipboard.writeText(url).then(() => toast({ title: "Link Copied" }));
    }
  };

  const handleEditPost = async () => {
    if (!db || !editContent.trim()) return;
    setIsUpdating(true);
    updateDocumentNonBlocking(doc(db, 'posts', post.id), {
      content: editContent.trim(),
      updatedAt: new Date().toISOString()
    });
    setIsUpdating(false);
    setIsEditModalOpen(false);
    toast({ title: "Post Updated" });
  };

  const handleDeletePost = () => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'posts', post.id));
    toast({ title: "Post Deleted" });
  };

  const handleArchivePost = () => {
    if (!db) return;
    const newStatus = post.status === 'archived' ? 'active' : 'archived';
    updateDocumentNonBlocking(doc(db, 'posts', post.id), { status: newStatus });
    toast({ title: post.status === 'archived' ? "Post Restored" : "Post Archived" });
  };

  const isAuthor = user?.uid === post.authorId;
  const images = post.imageUrls || (post.imageUrl ? [post.imageUrl] : []);

  return (
    <>
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
                {post.isPromoted && <BadgeCheck className="w-4 h-4 text-primary" />}
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">
                {mounted && post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthor ? (
                <>
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchivePost}>
                    <Archive className="w-4 h-4 mr-2" /> {post.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeletePost} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleShare}>
                    <Send className="w-4 h-4 mr-2" /> Share Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Reported" })}>
                    Report Content
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative w-full">
            {post.videoUrl ? (
              <div className="relative aspect-square w-full bg-black">
                <video src={post.videoUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
              </div>
            ) : images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((img: string, i: number) => (
                    <CarouselItem key={i}>
                      <Link href={`/post/${post.id}`}>
                        <div className="relative aspect-square w-full">
                          <Image src={img} alt={`Post image ${i + 1}`} fill className="object-cover" priority={priority && i === 0} unoptimized={img.startsWith('data:')} />
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2 bg-background/50 backdrop-blur border-none hover:bg-background/80" />
                    <CarouselNext className="right-2 bg-background/50 backdrop-blur border-none hover:bg-background/80" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                      {images.map((_: any, i: number) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm" />
                      ))}
                    </div>
                  </>
                )}
              </Carousel>
            ) : (
               <Link href={`/post/${post.id}`}>
                 <div className="p-6 text-lg font-medium bg-muted/30 italic min-h-[150px] flex items-center justify-center">
                   "{post.content}"
                 </div>
               </Link>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button onClick={handleLike} className={cn("transition-all active:scale-125", isLiked ? "text-accent" : "hover:opacity-60")}>
                  <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                </button>
                <Link href={`/post/${post.id}`} className="hover:opacity-60 transition-opacity">
                  <MessageCircle className="w-6 h-6" />
                </Link>
                <button onClick={handleShare} className="hover:opacity-60 transition-opacity">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button onClick={handleBookmark} className={cn("transition-all active:scale-125", isBookmarked ? "text-primary" : "hover:opacity-60")}>
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[150px]"
              placeholder="What's on your mind?"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPost} disabled={isUpdating} className="bg-primary">
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
