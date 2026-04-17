
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, MessageSquare, BadgeCheck, Star, Calendar, Globe } from 'lucide-react';
import Image from 'next/image';
import { SocialActions } from '@/components/social/SocialActions';

export default function BusinessProfilePage() {
  const { id } = useParams();
  const db = useFirestore();

  const bizRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'businesses', id as string);
  }, [db, id]);

  const { data: business, isLoading: isBizLoading } = useDoc(bizRef);

  const postsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'posts'),
      where('businessId', '==', id),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, id]);

  const { data: updates } = useCollection(postsQuery);

  if (isBizLoading) return <div className="p-20 text-center animate-pulse">Loading Business Profile...</div>;

  if (!business) {
    return (
      <div className="min-h-screen pb-20 md:pt-20">
        <Navbar />
        <main className="max-w-4xl mx-auto p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Business Not Found</h1>
          <Button variant="outline" asChild><a href="/explore">Discover More</a></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      
      {/* Hero Header */}
      <div className="w-full h-48 md:h-80 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="max-w-5xl mx-auto h-full flex items-end p-6 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end w-full">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={business.imageUrl} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {business.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold">{business.name}</h1>
                {business.isVerified && <BadgeCheck className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge variant="secondary" className="px-3 py-1">{business.category}</Badge>
                <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                  <Star className="w-4 h-4 fill-yellow-600" /> 4.8 (124 reviews)
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <SocialActions targetUserId={business.ownerId || business.id} isBusiness={true} />
              <Button variant="outline" className="font-bold">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-headline font-bold">About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {business.description}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-headline font-bold">Recent Updates</h2>
            {updates?.length ? (
              <div className="space-y-6">
                {updates.map(post => (
                  <Card key={post.id} className="overflow-hidden border-none shadow-sm bg-muted/20">
                    <CardContent className="p-0">
                      {post.imageUrl && (
                        <div className="relative aspect-video">
                          <Image src={post.imageUrl} alt="Update" fill className="object-cover" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <p className="text-sm">{post.content}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-sm">No recent updates from this business.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{business.locationDescription || 'Addis Ababa, Ethiopia'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>{business.contactPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-5 h-5 text-primary shrink-0" />
                <span className="text-primary hover:underline cursor-pointer">Visit Website</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <span>Open: 8:00 AM - 8:00 PM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
