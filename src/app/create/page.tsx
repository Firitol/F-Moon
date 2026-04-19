'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImagePlus, MessageSquare, Briefcase, Loader2, Sparkles, X, FileVideo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestPostCaption } from '@/ai/flows/suggest-post-caption';
import Image from 'next/image';

function CreateContent() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('post');
  const [content, setContent] = useState('');
  
  // Media states
  const [mediaItems, setMediaItems] = useState<{url: string, type: 'image' | 'video'}[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    const textParam = searchParams.get('text');
    const tabParam = searchParams.get('tab');
    if (textParam) {
      setContent(decodeURIComponent(textParam));
    }
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newMediaItems: {url: string, type: 'image' | 'video'}[] = [];

    for (const file of files) {
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const type = file.type.startsWith('video/') ? 'video' : 'image';
      newMediaItems.push({ url: result, type });
    }

    setMediaItems(prev => [...prev, ...newMediaItems]);
    toast({ title: "Media Added", description: `Added ${files.length} items.` });
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!user || !db) return;
    if (!content.trim() && mediaItems.length === 0) {
      toast({ title: "Error", description: "Please add some content.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const images = mediaItems.filter(m => m.type === 'image').map(m => m.url);
      const video = mediaItems.find(m => m.type === 'video')?.url || '';

      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        userName: user.displayName || 'User',
        userAvatar: user.photoURL || '',
        content,
        imageUrl: images[0] || '', 
        imageUrls: images,       
        videoUrl: video,
        isPromoted: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0
      });
      
      toast({ title: "Post Published!", description: "Sharing your update with the community." });
      router.push('/');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestCaption = async () => {
    const firstImage = mediaItems.find(m => m.type === 'image')?.url;
    if (!firstImage && !content) {
       toast({ title: "AI Tool", description: "Upload a photo or add a keyword first.", variant: "destructive" });
       return;
    }
    setIsSuggesting(true);
    try {
      const { caption } = await suggestPostCaption({
        description: content,
        photoDataUri: firstImage
      });
      setContent(caption);
      toast({ title: "Caption Suggested" });
    } catch (error) {
      toast({ title: "AI Error", description: "Could not suggest caption.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <Card className="border-none shadow-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-headline font-bold">New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/30 p-1 rounded-xl">
              <TabsTrigger value="post" className="rounded-lg">
                <MessageSquare className="w-4 h-4 mr-2" /> Community
              </TabsTrigger>
              <TabsTrigger value="business" className="rounded-lg">
                <Briefcase className="w-4 h-4 mr-2" /> Business
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <div className="bg-muted/50 rounded-2xl p-4 border-2 border-dashed border-border flex flex-col gap-4">
                {mediaItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mediaItems.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <Image 
                            src={item.url} 
                            alt="Upload preview" 
                            fill 
                            className="object-cover" 
                            unoptimized 
                          />
                        )}
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => removeMedia(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <label htmlFor="file-upload-more" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/40 transition-all bg-card/50">
                      <ImagePlus className="w-8 h-8 text-primary opacity-60" />
                      <span className="text-[10px] font-bold mt-2 uppercase tracking-widest text-primary">Add More</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*" 
                        id="file-upload-more" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </div>
                ) : (
                  <div className="text-center space-y-6 py-12">
                    <div className="flex justify-center gap-8">
                      <div className="p-4 bg-primary/10 rounded-2xl"><ImagePlus className="w-10 h-10 text-primary" /></div>
                      <div className="p-4 bg-accent/10 rounded-2xl"><FileVideo className="w-10 h-10 text-accent" /></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg">Upload High Quality Photos</h3>
                      <p className="text-sm text-muted-foreground">Select multiple images to create a carousel.</p>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                      <Button variant="default" className="bg-primary px-8 rounded-full" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer font-bold">
                          Choose Media
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Caption</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSuggestCaption}
                    disabled={isSuggesting || (mediaItems.length === 0 && !content)}
                    className="text-primary hover:bg-primary/10 h-8 font-bold text-xs"
                  >
                    {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                    AI SUGGEST
                  </Button>
                </div>
                <Textarea 
                  placeholder="Share your thoughts with Ethiopia..." 
                  className="min-h-[140px] text-base rounded-2xl resize-none focus-visible:ring-primary border-none bg-muted/30"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex gap-3 border-t p-6">
          <Button variant="outline" className="flex-1 rounded-full font-bold h-12" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="flex-1 bg-primary rounded-full font-bold h-12 shadow-lg hover:shadow-xl transition-all" 
            onClick={handleCreatePost}
            disabled={isSubmitting || (mediaItems.length === 0 && !content.trim())}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Publish to F-Moon
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function CreatePage() {
  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-secondary/10">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center animate-pulse font-bold text-primary">Preparing Studio...</div>}>
        <CreateContent />
      </Suspense>
    </div>
  );
}
