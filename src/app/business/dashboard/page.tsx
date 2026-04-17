
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MessageCircle, 
  PlusCircle, 
  Crown,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessDashboard() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch businesses owned by the current user
  const bizQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'businesses'), where('ownerId', '==', user.uid), limit(10));
  }, [db, user]);

  const { data: businesses, isLoading } = useCollection(bizQuery);

  // Mock analytics data for visual representation
  const chartData = [
    { name: 'Mon', views: 40, likes: 24 },
    { name: 'Tue', views: 30, likes: 13 },
    { name: 'Wed', views: 20, likes: 98 },
    { name: 'Thu', views: 27, likes: 39 },
    { name: 'Fri', views: 18, likes: 48 },
    { name: 'Sat', views: 23, likes: 38 },
    { name: 'Sun', views: 34, likes: 43 },
  ];

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Insights...</div>;

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Business Hub</h1>
            <p className="text-muted-foreground text-sm">Manage your listings and track engagement.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/business/settings"><Settings className="w-4 h-4 mr-2" /> Settings</Link>
            </Button>
            <Button size="sm" className="bg-primary" asChild>
              <Link href="/create?type=business"><PlusCircle className="w-4 h-4 mr-2" /> New Listing</Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
            <CardContent className="p-6">
              <Eye className="absolute top-4 right-4 opacity-20 w-12 h-12" />
              <p className="text-sm opacity-80 font-bold uppercase tracking-wider">Total Views</p>
              <h2 className="text-4xl font-bold mt-2">1,248</h2>
              <p className="text-xs mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% this week</p>
            </CardContent>
          </Card>
          <Card className="bg-accent text-accent-foreground border-none shadow-md overflow-hidden relative">
            <CardContent className="p-6">
              <MessageCircle className="absolute top-4 right-4 opacity-20 w-12 h-12" />
              <p className="text-sm opacity-80 font-bold uppercase tracking-wider">Inquiries</p>
              <h2 className="text-4xl font-bold mt-2">42</h2>
              <p className="text-xs mt-2 font-medium">8 pending response</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-none shadow-sm overflow-hidden relative">
            <CardContent className="p-6">
              <Users className="absolute top-4 right-4 opacity-10 w-12 h-12 text-primary" />
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Followers</p>
              <h2 className="text-4xl font-bold mt-2">856</h2>
              <p className="text-xs mt-2 text-primary font-bold">Growing Community</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-none shadow-sm overflow-hidden relative">
            <CardContent className="p-6">
              <Crown className="absolute top-4 right-4 opacity-10 w-12 h-12 text-primary" />
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Plan</p>
              <h2 className="text-4xl font-bold mt-2">Pro</h2>
              <Badge className="mt-2 bg-primary/20 text-primary border-none">Active</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>Views vs Interactivity over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--secondary))', opacity: 0.4}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>My Businesses</CardTitle>
              <CardDescription>Status and quick actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {businesses?.length ? (
                businesses.map((biz) => (
                  <div key={biz.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-1">
                      <p className="font-bold text-sm truncate max-w-[150px]">{biz.name}</p>
                      <Badge variant={biz.status === 'active' ? 'outline' : 'secondary'} className="text-[10px]">
                        {biz.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground italic">No businesses registered yet.</p>
                  <Button variant="link" size="sm" className="mt-2" asChild>
                    <Link href="/business">Register Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
