'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, BadgeCheck, Search, SlidersHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';
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

function ExploreContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || 'All';

  const [searchTerm, setSearchTerm] = useState(qParam);
  const [category, setCategory] = useState(catParam);
  const [sortBy, setSortBy] = useState('newest');
  const db = useFirestore();

  useEffect(() => {
    setSearchTerm(qParam);
  }, [qParam]);

  useEffect(() => {
    setCategory(catParam);
  }, [catParam]);

  const businessQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'businesses'), where('status', '==', 'active'), limit(50));
  }, [db]);

  const { data: businesses, isLoading } = useCollection(businessQuery);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    return businesses.filter(biz => {
      const name = biz.name || '';
      const desc = biz.description || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'All' || biz.category === category;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'verified') return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
      return 0;
    });
  }, [businesses, searchTerm, category, sortBy]);

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">Discover Ethiopia</h1>
          <p className="text-muted-foreground text-sm md:text-base">Explore verified local businesses and services across the country.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, category, or location..." 
              className="pl-12 h-12 rounded-2xl md:rounded-full bg-card border-none shadow-sm focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 rounded-2xl md:rounded-full flex-1 md:flex-none font-bold bg-card border-none shadow-sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort Preference</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                  <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="verified">Verified First</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {['All', 'Hotel', 'Restaurant', 'Shop', 'Tourism', 'Service', 'Other'].map((cat) => (
          <Badge 
            key={cat} 
            variant={category === cat ? 'default' : 'secondary'}
            className={`px-6 py-2 cursor-pointer whitespace-nowrap rounded-full font-bold transition-all ${category === cat ? 'scale-105 shadow-md' : 'hover:bg-secondary/80'}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-48 bg-muted/50 rounded-2xl border-none" />
          ))
        ) : filteredBusinesses.length ? (
          filteredBusinesses.map((biz) => (
            <Card key={biz.id} className="hover:shadow-xl transition-all duration-300 border-none shadow-sm overflow-hidden bg-card group rounded-2xl">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <Link href={`/business/${biz.id}`} className="w-full lg:w-64 h-48 md:h-56 lg:h-auto bg-primary/10 flex items-center justify-center text-primary text-6xl font-headline font-bold relative shrink-0 overflow-hidden">
                    <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">{biz.name?.[0] || 'B'}</span>
                    {biz.imageUrl && <img src={biz.imageUrl} alt={biz.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />}
                    {biz.isVerified && (
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur p-1.5 rounded-full shadow-lg">
                        <BadgeCheck className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/business/${biz.id}`}>
                            <h2 className="text-xl md:text-2xl font-headline font-bold hover:text-primary transition-colors line-clamp-1">{biz.name}</h2>
                          </Link>
                          {biz.isVerified && <BadgeCheck className="w-5 h-5 text-primary hidden md:block" />}
                        </div>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border-none">
                          {biz.category}
                        </Badge>
                      </div>
                      <Link href={`/business/${biz.id}`} className="p-2 rounded-full hover:bg-secondary transition-colors">
                        <ChevronRight className="w-6 h-6 text-muted-foreground" />
                      </Link>
                    </div>
                    
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed italic">
                      "{biz.description || 'No description provided.'}"
                    </p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary rounded-lg"><MapPin className="w-4 h-4 text-primary" /></div>
                        {biz.locationDescription || 'Location TBD'}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary rounded-lg"><Phone className="w-4 h-4 text-primary" /></div>
                        {biz.contactPhone || 'No contact phone'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary">
                      <SocialActions targetUserId={biz.ownerId || biz.id} isBusiness={true} className="flex-1" />
                      <Button variant="secondary" className="flex-1 font-bold h-10 md:h-11 rounded-xl" asChild>
                        <Link href={`/business/${biz.id}`}>
                          Explore Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-secondary shadow-inner">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/20 mb-6" />
            <p className="text-xl font-bold text-muted-foreground">No businesses found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or category filters.</p>
            <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => { setSearchTerm(''); setCategory('All'); }}>Clear All Filters</Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-secondary/10">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-4xl mx-auto p-20 text-center flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Discovering Ethiopia...</p>
        </div>
      }>
        <ExploreContent />
      </Suspense>
    </div>
  );
}