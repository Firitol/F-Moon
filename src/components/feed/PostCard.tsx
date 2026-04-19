'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck, Pencil, Trash2, Archive, Loader2 } from 'lucide-react';
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

interface PostCardProps {
  post: any;
  priority?: boolean;
}

function PhotoGrid({ images, postId }: { images: string[], postId: string }) {
  const count = images.length;
  
  if (count === 1) {
    return (
      <Link href={`/post/${postId}`} className="block w-full">
        <div className="relative aspect-auto min-h-[300px] w-full bg-muted">
          <Image 
            src={images[0]} 
            alt="Post" 
            width={800} 
            height={800}
            className="w-full h-auto object-contain"
            unoptimized={images[0].startsWith('data:')}
          />
        </div>
      </Link>
    );
  }

  if (count === 2) {
    return (
      <Link href={`/post/${postId}`} className="grid grid-cols-2 gap-0.5 w-full bg-border border-y border-border">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden">
            <Image src={img} alt="Post" fill className="object-cover" unoptimized={img.startsWith('data:')} />
          </div>
        ))}
      </Link>
    );
  }

  if (count === 3) {
    return (
      <Link href={`/post/${postId}`} className="grid grid-cols-2 gap-0.5 w-full bg-border border-y border-border">
        <div className="relative aspect-[3/4] overflow-hidden col-span-1">
          <Image src={images[0]} alt="Post" fill className="object-cover" unoptimized={images[0].startsWith('data:')} />
        </div>
        <div className="grid grid-rows-2 gap-0.5 col-span-1">
          <div className="relative aspect-square overflow-hidden">
            <Image src={images[1]} alt="Post" fill className="object-cover" unoptimized={images[1].startsWith('data:')} />
          </div>
          <div className="relative aspect-square overflow-hidden">
            <Image src={images[2]} alt="Post" fill className="object-cover" unoptimized={images[2].startsWith('data:')} />
          </div>
        </div>
      </Link>
    );
  }

  if (count === 4) {
    return (
      <Link href={`/post/${postId}`} className="grid grid-cols-2 gap-0.5 w-full bg-border border-y border-border">
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden">
            <Image src={img} alt="Post" fill className="object-cover" unoptimized={img.startsWith('data:')} />
          </div>
        ))}
      </Link>
    );
  }

  // 5 or more photos
  return (
    <Link href={`/post/${postId}`} className="grid grid-cols-2 gap-0.5 w-full bg-border border-y border-border">
      {images.slice(0, 3).map((img, i) => (
        <div key={i} className="relative aspect-square overflow-hidden">
          <Image src={img} alt="Post" fill className="object-cover" unoptimized={img.startsWith('data:')} />
        </div>
      ))}
      <div className="relative aspect-square overflow-hidden group">
        <Image src={images[3]} alt="Post" fill className="object-cover opacity-60" unoptimized={images[3].startsWith('data:')} />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white group-hover:bg-black/50 transition-colors">
          <span className="text-3xl font-bold">+{count - 3}</span>
        </div>
      </div>
    </Link>
  );
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
      <Card className="w-full max-w-xl mx-auto border-none shadow-none md:border md:shadow-sm mb-6 rounded-none md:rounded-2xl overflow-hidden bg-card transition-all">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <ProfileHoverCard id={post.authorId} type="user" initialData={{ name: post.userName, avatar: post.userAvatar }}>
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={post.userAvatar} />
                <AvatarFallback>{post.userName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </ProfileHoverCard>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <ProfileHoverCard id={post.authorId} type="user" initialData={{ name: post.userName, avatar: post.userAvatar }}>
                  <span className="text-sm font-bold hover:text-primary transition-colors cursor-pointer">{post.userName}</span>
                </ProfileHoverCard>
                {post.isPromoted && <BadgeCheck className="w-4 h-4 text-primary" />}
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                {mounted && post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              {isAuthor ? (
                <>
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-lg">
                    <Pencil className="w-4 h-4 mr-3" /> Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchivePost} className="rounded-lg">
                    <Archive className="w-4 h-4 mr-3" /> {post.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeletePost} className="text-destructive focus:text-destructive rounded-lg font-bold">
                    <Trash2 className="w-4 h-4 mr-3" /> Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleShare} className="rounded-lg">
                    <Send className="w-4 h-4 mr-3" /> Share Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Reported", description: "Thank you for keeping our community safe." })} className="rounded-lg">
                    Report Content
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative w-full overflow-hidden">
            {post.videoUrl ? (
              <div className="relative aspect-square w-full bg-black">
                <video src={post.videoUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
              </div>
            ) : images.length > 0 ? (
              <PhotoGrid images={images} postId={post.id} />
            ) : (
               <Link href={`/post/${post.id}`}>
                 <div className="p-10 text-xl font-medium bg-gradient-to-br from-primary/5 to-accent/5 italic min-h-[200px] flex items-center justify-center text-center">
                   "{post.content}"
                 </div>
               </Link>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <button onClick={handleLike} className={cn("transition-all active:scale-125", isLiked ? "text-accent" : "hover:text-primary")}>
                  <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                </button>
                <Link href={`/post/${post.id}`} className="hover:text-primary transition-all active:scale-125">
                  <MessageCircle className="w-6 h-6" />
                </Link>
                <button onClick={handleShare} className="hover:text-primary transition-all active:scale-125">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button onClick={handleBookmark} className={cn("transition-all active:scale-125", isBookmarked ? "text-primary" : "hover:text-primary")}>
                <Bookmark className={cn("w-6 h-6", isBookmarked && "fill-current")} />
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-bold">{(post.likesCount || 0).toLocaleString()} likes</p>
              <div className="text-sm leading-relaxed">
                <span className="font-bold mr-2">{post.userName}</span>
                {post.content}
              </div>
              {post.commentsCount > 0 && (
                <Link href={`/post/${post.id}`} className="text-xs text-muted-foreground mt-2 hover:underline block font-medium">
                  View all {post.commentsCount} comments
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Update</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[160px] rounded-xl resize-none text-base bg-muted/30 border-none focus-visible:ring-primary"
              placeholder="What's on your mind?"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPost} disabled={isUpdating} className="flex-1 bg-primary rounded-full font-bold">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}