
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, Bookmark, Settings, UserPlus, MessageSquare } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import Image from 'next/image';

export default function CurrentUserProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'public_user_profiles', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  const postsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'posts'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: userPosts, isLoading: isPostsLoading } = useCollection(postsQuery);

  if (isUserLoading) return <div className="p-20 text-center animate-pulse">Loading Profile...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full p-6 text-center space-y-4">
          <h2 className="text-xl font-bold">Please log in to view your profile</h2>
          <Button asChild className="w-full">
            <a href="/login">Log In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative group">
            <div className="p-1 rounded-full instagram-gradient">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background">
                <AvatarImage src={profile?.profilePictureUrl || user.photoURL || ''} />
                <AvatarFallback className="text-4xl">{(profile?.name || user.displayName || 'U')[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-2xl font-headline font-bold">{profile?.name || user.displayName || 'User'}</h1>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="font-bold">Edit Profile</Button>
                <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-8 text-sm">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">{userPosts?.length || 0}</span>
                <span className="text-muted-foreground">posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">856</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">412</span>
                <span className="text-muted-foreground">following</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-sm">@{user.email?.split('@')[0]}</p>
              <p className="text-sm whitespace-pre-wrap">{profile?.bio || 'No bio yet.'}</p>
              {profile?.location && (
                <p className="text-xs text-primary font-medium">{profile.location}</p>
              )}
            </div>
          </div>
        </header>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-transparent border-t rounded-none h-12">
            <TabsTrigger value="posts" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Grid className="w-4 h-4 mr-2" /> POSTS
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Bookmark className="w-4 h-4 mr-2" /> SAVED
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-8">
            {isPostsLoading ? (
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-muted animate-pulse" />
                ))}
              </div>
            ) : userPosts?.length ? (
              <div className="grid grid-cols-3 gap-1 md:gap-6">
                {userPosts.map((post) => (
                  <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-md">
                    {post.imageUrl ? (
                      <Image 
                        src={post.imageUrl} 
                        alt="User post" 
                        fill 
                        className="object-cover transition-transform group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center p-2 text-[10px] text-center italic">
                        {post.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Grid className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground">No posts yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-8">
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground">Saved posts will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
