
'use client';

import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type Post } from '@/lib/mock-data';
import { ProfileHoverCard } from '@/components/profile/ProfileHoverCard';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  // Safe defaults for numeric fields to prevent undefined errors
  const likesCount = post.likesCount || 0;
  const commentsCount = post.commentsCount || 0;

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
            <span className="text-xs text-muted-foreground">{post.createdAt}</span>
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
              data-ai-hint="post image"
              priority={priority}
              unoptimized={post.imageUrl.startsWith('data:')}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            />
          </div>
        ) : null}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button className="hover:opacity-60 transition-opacity"><Heart className="w-6 h-6" /></button>
              <button className="hover:opacity-60 transition-opacity"><MessageCircle className="w-6 h-6" /></button>
              <button className="hover:opacity-60 transition-opacity"><Send className="w-6 h-6" /></button>
            </div>
            <button className="hover:opacity-60 transition-opacity"><Bookmark className="w-6 h-6" /></button>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{likesCount.toLocaleString()} likes</p>
            <div className="text-sm leading-relaxed">
              <ProfileHoverCard id={post.authorId} type="user" initialData={{ name: post.userName, avatar: post.userAvatar }}>
                <span className="font-bold mr-2">{post.userName}</span>
              </ProfileHoverCard>
              {post.content}
            </div>
            <button className="text-sm text-muted-foreground mt-1">
              View all {commentsCount} comments
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
