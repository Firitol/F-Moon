
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/feed/PostCard';
import { MOCK_POSTS, MOCK_USERS, MOCK_BUSINESSES } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { PromotionGenerator } from '@/components/business/PromotionGenerator';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto flex justify-center gap-8 p-4">
        {/* Main Feed */}
        <div className="w-full max-w-xl">
          {/* Stories-like placeholder */}
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
            {MOCK_USERS.map((user) => (
              <div key={user.id} className="flex flex-col items-center gap-1 min-w-[72px]">
                <div className="p-[2px] rounded-full instagram-gradient">
                  <Avatar className="h-16 w-16 ring-2 ring-background">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs truncate w-full text-center">{user.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Sidebar (Desktop Only) */}
        <aside className="hidden lg:block w-80 space-y-6 sticky top-20 h-fit">
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarImage src={MOCK_USERS[0].avatar} />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm">Abebe Bikila</p>
                <p className="text-xs text-muted-foreground">Ethiopian Explorer</p>
              </div>
              <button className="ml-auto text-xs font-bold text-primary hover:text-primary/80">Switch</button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-muted-foreground">Featured Businesses</span>
              <button className="text-xs font-bold hover:underline">View All</button>
            </div>
            
            {MOCK_BUSINESSES.map(biz => (
              <div key={biz.id} className="flex items-center gap-3 px-1">
                <Avatar className="h-10 w-10 ring-1 ring-border">
                  <AvatarFallback className="bg-secondary text-primary font-bold">
                    {biz.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold">{biz.name}</p>
                    {biz.isVerified && <BadgeCheck className="w-3 h-3 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{biz.category}</p>
                </div>
                <button className="text-xs font-bold text-primary hover:text-primary/80">Follow</button>
              </div>
            ))}
          </div>

          <PromotionGenerator />

          <footer className="px-1 text-[10px] text-muted-foreground uppercase tracking-widest space-y-2">
            <p>About • Help • Press • API • Jobs • Privacy • Terms</p>
            <p>© 2024 F-MOON FROM ETHIOPIA</p>
          </footer>
        </aside>
      </main>
    </div>
  );
}
