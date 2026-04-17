
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { MOCK_BUSINESSES } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, MessageSquare, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExplorePage() {
  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-headline font-bold mb-6 text-primary">Discover Ethiopia</h1>
        
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {['All', 'Hotels', 'Restaurants', 'Shops', 'Tourism', 'Services'].map((cat) => (
            <Badge 
              key={cat} 
              variant={cat === 'All' ? 'default' : 'secondary'}
              className="px-4 py-1 cursor-pointer whitespace-nowrap"
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="grid gap-6">
          {MOCK_BUSINESSES.map((biz) => (
            <Card key={biz.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 bg-secondary rounded-lg flex items-center justify-center text-primary text-3xl font-headline font-bold">
                    {biz.name[0]}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-headline font-bold">{biz.name}</h2>
                      {biz.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/20">{biz.category}</Badge>
                    <p className="text-sm text-muted-foreground">{biz.description}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {biz.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {biz.contact}
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-end">
                    <Button className="bg-primary flex-1 md:flex-none">Follow</Button>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
