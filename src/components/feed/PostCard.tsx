
'use client';

import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type Post } from '@/lib/mock-data';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="w-full max-w-xl mx-auto border-none shadow-none md:border md:shadow-sm mb-6 rounded-none md:rounded-lg overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback>{post.userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold hover:underline cursor-pointer">{post.userName}</span>
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
        {post.imageUrl && (
          <div className="relative aspect-square w-full">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              data-ai-hint="Ethiopia post"
            />
          </div>
        )}
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
            <p className="text-sm font-bold">{post.likes.toLocaleString()} likes</p>
            <p className="text-sm leading-relaxed">
              <span className="font-bold mr-2">{post.userName}</span>
              {post.content}
            </p>
            <button className="text-sm text-muted-foreground mt-1">
              View all {post.commentsCount} comments
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
