
'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, MessageSquare, BadgeCheck, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { SocialActions } from '@/components/social/SocialActions';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const db = useFirestore();

  const businessQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'businesses'), where('status', '==', 'active'), limit(50));
  }, [db]);

  const { data: businesses, isLoading } = useCollection(businessQuery);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    return businesses.filter(biz => {
      const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           biz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'All' || biz.category === category;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'verified') return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
      return 0;
    });
  }, [businesses, searchTerm, category, sortBy]);

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-headline font-bold text-primary">Discover Ethiopia</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search businesses..." 
                className="pl-10 rounded-full focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                  <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="verified">Verified First</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Hotel', 'Restaurant', 'Shop', 'Tourism', 'Service'].map((cat) => (
            <Badge 
              key={cat} 
              variant={category === cat ? 'default' : 'secondary'}
              className="px-6 py-1.5 cursor-pointer whitespace-nowrap rounded-full"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-40 bg-muted/50 rounded-xl" />
            ))
          ) : filteredBusinesses.length ? (
            filteredBusinesses.map((biz) => (
              <Card key={biz.id} className="hover:shadow-xl transition-all duration-300 border-none shadow-sm overflow-hidden bg-card group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <Link href={`/business/${biz.id}`} className="w-full md:w-48 h-48 bg-primary/10 flex items-center justify-center text-primary text-5xl font-headline font-bold relative">
                      {biz.name[0]}
                      {biz.isVerified && (
                        <div className="absolute top-2 right-2 bg-background p-1 rounded-full shadow-sm">
                          <BadgeCheck className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Link href={`/business/${biz.id}`}>
                          <h2 className="text-xl font-headline font-bold hover:text-primary transition-colors">{biz.name}</h2>
                          <Badge variant="outline" className="text-xs">{biz.category}</Badge>
                        </Link>
                        <Link href={`/business/${biz.id}`}>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </Link>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">{biz.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {biz.locationDescription || 'Location TBD'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {biz.contactPhone}
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <SocialActions targetUserId={biz.ownerId || biz.id} isBusiness={true} className="flex-1" />
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href={`/business/${biz.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">No businesses found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setCategory('All'); }}>Clear filters</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
