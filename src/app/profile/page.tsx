'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, limit, setDoc, updateDoc } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Grid, Bookmark, Settings, LogOut, PlayCircle, Camera, Loader2, MapPin, Heart, Archive } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PostCard } from '@/components/feed/PostCard';

export default function CurrentUserProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    location: ''
  });

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'public_user_profiles', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && !isUserLoading && !profile && db) {
      const initProfile = async () => {
        const newProfile = {
          name: user.displayName || 'User',
          profilePictureUrl: user.photoURL || '',
          bio: 'Discovering F-Moon!',
          location: 'Addis Ababa',
          userId: user.uid,
          id: user.uid,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'public_user_profiles', user.uid), newProfile);
      };
      initProfile();
    }
  }, [user, isUserLoading, profile, db]);

  // Fetch all user posts for filtering locally
  const postsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'posts'), where('authorId', '==', user.uid), limit(100));
  }, [db, user]);

  const { data: allUserPosts, isLoading: isPostsLoading } = useCollection(postsQuery);

  const userPosts = useMemo(() => {
    if (!allUserPosts) return [];
    return allUserPosts
      .filter(p => p.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allUserPosts]);

  const archivedPosts = useMemo(() => {
    if (!allUserPosts) return [];
    return allUserPosts
      .filter(p => p.status === 'archived')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allUserPosts]);

  const savedQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'bookmarks'), where('userId', '==', user.uid), limit(50));
  }, [db, user]);

  const { data: rawSavedPosts, isLoading: isSavedLoading } = useCollection(savedQuery);

  const savedPosts = useMemo(() => {
    if (!rawSavedPosts) return [];
    return [...rawSavedPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rawSavedPosts]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && db && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await updateDoc(doc(db, 'public_user_profiles', user.uid), {
            profilePictureUrl: base64String
          });
          toast({ title: "Success", description: "Profile photo updated!" });
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!db || !user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'public_user_profiles', user.uid), {
        name: editData.name,
        bio: editData.bio,
        location: editData.location
      });
      toast({ title: "Success", description: "Profile updated successfully!" });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-primary font-bold">Initializing Session...</div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-sm w-full p-8 text-center space-y-6 shadow-xl border-none ring-1 ring-border">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Join the Community</h2>
            <p className="text-muted-foreground text-sm">Please sign in to access your profile and shared content.</p>
          </div>
          <Button asChild className="w-full bg-primary h-12 text-lg font-bold">
            <Link href="/login">Get Started</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="p-1 rounded-full instagram-gradient shadow-lg transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background overflow-hidden relative">
                <AvatarImage src={profile?.profilePictureUrl || user.photoURL || ''} className="object-cover" />
                <AvatarFallback className="text-4xl bg-secondary text-primary font-bold">
                  {(profile?.name || user.displayName || 'U')[0]}
                </AvatarFallback>
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white w-8 h-8 mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest">Update</span>
                </div>
              </Avatar>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
              <h1 className="text-2xl font-headline font-bold">{profile?.name || user.displayName || 'User'}</h1>
              <div className="flex gap-2 justify-center">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="font-bold hover:bg-secondary/80 transition-colors">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="font-headline">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell us about yourself..." value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} className="min-h-[100px]" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g. Addis Ababa, Ethiopia" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleUpdateProfile} disabled={isUpdating} className="bg-primary font-bold w-full sm:w-auto">
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-destructive/10">
                  <LogOut className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-8 text-sm">
              <div className="flex flex-col items-center md:items-start group cursor-default">
                <span className="font-bold group-hover:text-primary transition-colors">{userPosts?.length || 0}</span>
                <span className="text-muted-foreground">posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start group cursor-default">
                <span className="font-bold group-hover:text-primary transition-colors">{profile?.followerCount || 0}</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start group cursor-default">
                <span className="font-bold group-hover:text-primary transition-colors">{profile?.followingCount || 0}</span>
                <span className="text-muted-foreground">following</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-sm">@{user.email?.split('@')[0] || user.uid.substring(0, 8)}</p>
              <p className="text-sm whitespace-pre-wrap max-w-md mx-auto md:mx-0">{profile?.bio || 'Discovering F-Moon!'}</p>
              {profile?.location && (
                <p className="text-xs text-primary font-bold flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </p>
              )}
            </div>
          </div>
        </header>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-transparent border-t rounded-none h-12">
            <TabsTrigger value="posts" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Grid className="w-4 h-4 mr-2" /> POSTS
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Bookmark className="w-4 h-4 mr-2" /> SAVED
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none bg-transparent">
              <Archive className="w-4 h-4 mr-2" /> ARCHIVE
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-8">
            {isPostsLoading ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />)}
              </div>
            ) : userPosts?.length ? (
              <div className="grid grid-cols-3 gap-1 md:gap-6">
                {userPosts.map((post) => (
                  <Link href={`/post/${post.id}`} key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-muted shadow-sm hover:shadow-md transition-shadow">
                    {post.imageUrl ? (
                      <Image src={post.imageUrl} alt="User post" fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized={post.imageUrl.startsWith('data:')} sizes="(max-width: 768px) 33vw, 300px" />
                    ) : post.videoUrl ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <PlayCircle className="w-10 h-10 text-white opacity-50 z-10" />
                        <video src={post.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-70" muted />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center p-2 text-[10px] text-center italic text-muted-foreground font-medium">
                        {post.content}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card rounded-2xl border-2 border-dashed">
                <Grid className="w-16 h-16 mx-auto mb-4 opacity-10 text-primary" />
                <p className="text-muted-foreground font-medium">Share your first post with Ethiopia!</p>
                <Button variant="link" asChild className="mt-2 text-primary">
                   <Link href="/create">Create Post</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-8">
            {isSavedLoading ? (
               <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />)}
              </div>
            ) : savedPosts?.length ? (
              <div className="grid grid-cols-3 gap-1 md:gap-6">
                {savedPosts.map((saved) => (
                  <Link href={`/post/${saved.postId}`} key={saved.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-muted">
                    {saved.postData?.imageUrl ? (
                      <Image src={saved.postData.imageUrl} alt="Saved post" fill className="object-cover transition-transform group-hover:scale-110" unoptimized={saved.postData.imageUrl.startsWith('data:')} sizes="(max-width: 768px) 33vw, 300px" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center p-2 text-[10px] text-center italic text-muted-foreground">
                        {saved.postData?.content || 'Saved Post'}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur p-1 rounded-full">
                       <Bookmark className="w-3 h-3 text-white fill-current" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/20">
                <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-10 text-accent" />
                <p className="text-muted-foreground font-medium">Saved posts will appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-8">
            {isPostsLoading ? (
               <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />)}
              </div>
            ) : archivedPosts?.length ? (
              <div className="grid grid-cols-3 gap-1 md:gap-6">
                {archivedPosts.map((post) => (
                  <Link href={`/post/${post.id}`} key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-muted">
                    {post.imageUrl ? (
                      <Image src={post.imageUrl} alt="Archived post" fill className="object-cover transition-transform group-hover:scale-110" unoptimized={post.imageUrl.startsWith('data:')} sizes="(max-width: 768px) 33vw, 300px" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center p-2 text-[10px] text-center italic text-muted-foreground">
                        {post.content}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-muted/80 backdrop-blur p-1 rounded-full">
                       <Archive className="w-3 h-3 text-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/20">
                <Archive className="w-16 h-16 mx-auto mb-4 opacity-10 text-muted-foreground" />
                <p className="text-muted-foreground font-medium">No archived posts.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
