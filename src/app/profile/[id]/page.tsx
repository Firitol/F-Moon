
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, ShieldAlert, PlayCircle, MapPin, Calendar, Heart } from 'lucide-react';
import Image from 'next/image';
import { SocialActions } from '@/components/social/SocialActions';

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-headline font-bold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.id.substring(0, 8)}</p>
              </div>
              <SocialActions targetUserId={profile.userId} />
            </div>

            <div className="flex justify-center md:justify-start gap-8 text-sm">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">{userPosts?.length || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">{profile.followerCount || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">{profile.friendCount || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">friends</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap max-w-lg">{profile.bio || 'Discovering Ethiopia!'}</p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center md:justify-start">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(profile.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="posts" className="w-full border-t pt-2">
          <TabsList className="w-full flex justify-center bg-transparent h-12">
            <TabsTrigger value="posts" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Grid className="w-4 h-4 mr-2" /> POSTS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-8">
            {isPostsLoading ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
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
                        <PlayCircle className="w-10 h-10 text-white opacity-50 z-10" />
                        <video src={post.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" muted />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center p-2 text-xs text-center italic text-muted-foreground">
                        {post.content}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                       <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" /> {post.likesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground italic border rounded-xl border-dashed">
                No active posts yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
