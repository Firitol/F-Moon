
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BadgeCheck, MapPin, Users, Calendar } from 'lucide-react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

interface ProfileHoverCardProps {
  children: React.ReactNode;
  id: string;
  type: 'user' | 'business';
  initialData?: any;
}

export function ProfileHoverCard({ children, id, type, initialData }: ProfileHoverCardProps) {
  const db = useFirestore();

  const docRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    const collectionName = type === 'user' ? 'public_user_profiles' : 'businesses';
    return doc(db, collectionName, id);
  }, [db, id, type]);

  const { data: fetchedData, isLoading } = useDoc(docRef);
  const data = fetchedData || initialData;

  const profileUrl = type === 'user' ? `/profile/${id}` : `/business/${id}`;

  return (
    <HoverCard openDelay={400} closeDelay={200}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:underline inline-block">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 space-y-4">
          <div className="flex justify-between items-start">
            <Avatar className="h-16 w-16 ring-4 ring-background shadow-sm">
              <AvatarImage src={data?.profilePictureUrl || data?.imageUrl || data?.avatar} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {(data?.name || data?.userName || 'F')[0]}
              </AvatarFallback>
            </Avatar>
            <Button size="sm" variant="default" className="rounded-full h-8 px-4 font-bold">
              Follow
            </Button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <h3 className="font-headline font-bold text-lg leading-tight">
                {data?.name || data?.userName || 'Loading...'}
              </h3>
              {(data?.isVerified || type === 'business') && (
                <BadgeCheck className="w-4 h-4 text-primary fill-primary/10" />
              )}
            </div>
            {type === 'user' ? (
              <p className="text-sm text-muted-foreground font-medium">@{id.substring(0, 8)}</p>
            ) : (
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{data?.category || 'Business'}</p>
            )}
          </div>

          <p className="text-sm line-clamp-2 text-muted-foreground italic">
            {data?.bio || data?.description || 'Discovering the best of Ethiopia together.'}
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground pt-2 border-t">
            {type === 'user' ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-foreground">856</span> Followers
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-foreground">412</span> Following
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {data?.locationDescription || 'Addis Ababa'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  1.2k Customers
                </div>
              </>
            )}
          </div>

          <Button variant="secondary" size="sm" className="w-full rounded-full font-bold h-9" asChild>
            <Link href={profileUrl}>
              View {type === 'user' ? 'Profile' : 'Business'}
            </Link>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
