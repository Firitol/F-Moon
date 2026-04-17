
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, UserPlus, MessageSquare, ShieldAlert, PlayCircle } from 'lucide-react';
import Image from 'next/image';

export default function UserProfilePage() {
  const { id } = useParams();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'public_user_profiles', id as string);
  }, [db, id]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const postsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'posts'),
      where('authorId', '==', id),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(21)
    );
  }, [db, id]);

  const { data: userPosts, isLoading: isPostsLoading } = useCollection(postsQuery);

  if (isProfileLoading) return <div className="p-20 text-center animate-pulse">Loading Profile...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen pb-20 md:pt-20">
        <Navbar />
        <main className="max-w-4xl mx-auto p-8 text-center space-y-4">
          <ShieldAlert className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground">The profile you are looking for does not exist or has been removed.</p>
          <Button variant="outline" asChild><a href="/">Back to Feed</a></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="p-1 rounded-full instagram-gradient">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background">
              <AvatarImage src={profile.profilePictureUrl} />
              <AvatarFallback className="text-4xl">{profile.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-2xl font-headline font-bold">{profile.name}</h1>
              <div className="flex gap-2 justify-center">
                <Button className="bg-primary font-bold px-8">Follow</Button>
                <Button variant="secondary" className="font-bold">Message</Button>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-8 text-sm">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">{userPosts?.length || 0}</span>
                <span className="text-muted-foreground">posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">1.2k</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">842</span>
                <span className="text-muted-foreground">following</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-sm">@{profile.id.substring(0, 8)}</p>
              <p className="text-sm whitespace-pre-wrap">{profile.bio || 'Discovering Ethiopia!'}</p>
              {profile.location && (
                <p className="text-xs text-primary font-medium flex items-center gap-1 justify-center md:justify-start">
                  <UserPlus className="w-3 h-3" /> {profile.location}
                </p>
              )}
            </div>
          </div>
        </header>

        <Tabs defaultValue="posts" className="w-full border-t">
          <TabsList className="w-full flex justify-center bg-transparent h-12">
            <TabsTrigger value="posts" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Grid className="w-4 h-4 mr-2" /> POSTS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-8">
            {isPostsLoading ? (
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-muted animate-pulse" />
                ))}
              </div>
            ) : userPosts?.length ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-muted">
                    {post.imageUrl ? (
                      <Image 
                        src={post.imageUrl} 
                        alt="User post" 
                        fill 
                        className="object-cover transition-transform group-hover:scale-105" 
                        unoptimized={post.imageUrl.startsWith('data:')}
                      />
                    ) : post.videoUrl ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-10 h-10 text-white opacity-50" />
                        <video src={post.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" muted />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center p-2 text-xs text-center italic">
                        {post.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground italic">
                No active posts yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
