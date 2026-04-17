
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, ShieldX, Eye, MessageSquare, Heart } from 'lucide-react';
import Image from 'next/image';

export default function PostModeration() {
  const db = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
  }, [db]);

  const { data: posts, isLoading } = useCollection(postsQuery);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)
        ) : posts?.length ? (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-muted">
                {post.imageUrl ? (
                  <Image src={post.imageUrl} alt="Post" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-sm p-4">
                    Text-only post
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {post.isPromoted && <Badge className="bg-primary">PROMOTED</Badge>}
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">{post.status}</Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{post.authorId?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold truncate flex-1">{post.authorId}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-sm line-clamp-3 text-muted-foreground italic">"{post.content}"</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likesCount || 0}</div>
                  <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentsCount || 0}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button variant="outline" size="sm" title="View details"><Eye className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="text-orange-500 hover:bg-orange-50" title="Moderate content">
                    <ShieldX className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/5" title="Delete permanently">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground">No posts found in the directory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
