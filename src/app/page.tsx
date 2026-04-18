'use client';

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/feed/PostCard';
import { useCollection, useMemoFirebase, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { PromotionGenerator } from '@/components/business/PromotionGenerator';
import { BadgeCheck, Sparkles } from 'lucide-react';
import { ProfileHoverCard } from '@/components/profile/ProfileHoverCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SocialActions } from '@/components/social/SocialActions';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'public_user_profiles', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  // Fetch posts without complex ordering to avoid index requirements
  const postsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'posts'), limit(50));
  }, [db]);

  const { data: rawPosts, isLoading: isPostsLoading } = useCollection(postsQuery);

  // Filter and Sort on the client side for stability
  const posts = useMemo(() => {
    if (!rawPosts) return [];
    return rawPosts
      .filter(post => post.status === 'active')
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [rawPosts]);

  const featuredBizQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'businesses'), limit(20));
  }, [db]);

  const { data: featuredBiz } = useCollection(featuredBizQuery);

  const suggestedBusinesses = featuredBiz
    ?.filter(biz => biz.status === 'active' && biz.ownerId !== user?.uid)
    .slice(0, 5);

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-secondary/10">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto flex justify-center gap-8 p-4">
        {/* Main Feed */}
        <div className="w-full max-w-xl">
          {!posts?.length && !isPostsLoading && (
            <Card className="mb-6 p-12 text-center border-dashed border-2">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Welcome to F-Moon</h2>
              <p className="text-muted-foreground mb-6 text-sm">Be the first to share something with the community!</p>
              <Button asChild className="bg-primary font-bold"><Link href="/create">Create First Post</Link></Button>
            </Card>
          )}

          <div className="space-y-6">
            {posts?.map((post, index) => (
              <PostCard key={post.id} post={post} priority={index === 0} />
            ))}
            {isPostsLoading && [1,2,3].map(i => <div key={i} className="h-96 bg-card animate-pulse rounded-xl mb-6" />)}
          </div>
        </div>

        {/* Sidebar (Desktop Only) */}
        <aside className="hidden lg:block w-80 space-y-6 sticky top-20 h-fit">
          {user && (
            <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <Link href="/profile">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                    <AvatarImage src={profile?.profilePictureUrl || user.photoURL || ''} />
                    <AvatarFallback>{profile?.name?.[0] || user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{profile?.name || user.displayName || 'Anonymous User'}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">My Account</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-primary font-bold">
                  <Link href="/profile">View</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Featured Businesses</span>
              <Link href="/explore" className="text-xs font-bold hover:underline text-primary">Explore</Link>
            </div>
            
            {suggestedBusinesses?.map(biz => (
              <div key={biz.id} className="flex items-center gap-3 px-1 group">
                <ProfileHoverCard id={biz.id} type="business">
                  <Avatar className="h-10 w-10 ring-1 ring-border group-hover:ring-primary/50 transition-all">
                    <AvatarImage src={biz.imageUrl} />
                    <AvatarFallback className="bg-secondary text-primary font-bold">
                      {biz.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </ProfileHoverCard>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <ProfileHoverCard id={biz.id} type="business">
                      <p className="text-sm font-semibold truncate hover:text-primary transition-colors">{biz.name}</p>
                    </ProfileHoverCard>
                    {biz.isVerified && <BadgeCheck className="w-3 h-3 text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{biz.category}</p>
                </div>
                <SocialActions targetUserId={biz.ownerId || biz.id} isBusiness={true} variant="minimal" />
              </div>
            ))}
          </div>

          <PromotionGenerator />

          <footer className="px-1 text-[10px] text-muted-foreground uppercase tracking-widest space-y-2 opacity-50">
            <p className="flex flex-wrap gap-x-2">
              <span>About</span> <span>Help</span> <span>Privacy</span> <span>Terms</span>
            </p>
            <p>© 2024 F-MOON ETHIOPIA</p>
          </footer>
        </aside>
      </main>
    </div>
  );
}