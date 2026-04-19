
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ImagePlus, MessageSquare, Briefcase, Loader2, Sparkles, X, FileVideo, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [mediaItems, setMediaItems] = useState<{url: string, type: 'image' | 'video', zoom: number}[]>([]);
  const [pendingMedia, setPendingMedia] = useState<string | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(100);

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

    // We process each file. For images, we open the adjustment dialog for the FIRST one.
    // In a production app with multi-upload, you'd typically have a mini-editor for each.
    // For simplicity, we'll allow multiple selection but the "Adjust" flow will apply to the current batch.
    
    const newMediaItems: {url: string, type: 'image' | 'video', zoom: number}[] = [];

    for (const file of files) {
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      if (type === 'image') {
        // For images, we can either bulk add or adjust one by one. 
        // Let's allow bulk adding but keep the adjustment modal available.
        newMediaItems.push({ url: result, type: 'image', zoom: 100 });
      } else {
        newMediaItems.push({ url: result, type: 'video', zoom: 100 });
      }
    }

    setMediaItems(prev => [...prev, ...newMediaItems]);
    toast({ title: "Media Attached", description: `${files.length} items added.` });
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
        imageUrl: images[0] || '', // Legacy support
        imageUrls: images,       // New multi-image support
        videoUrl: video,
        isPromoted: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0
      });
      
      toast({ title: "Success", description: "Post published!" });
      router.push('/');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestCaption = async () => {
    if (mediaItems.length === 0) {
       toast({ title: "AI", description: "Upload a photo first for better suggestions.", variant: "destructive" });
       return;
    }
    setIsSuggesting(true);
    try {
      const firstImage = mediaItems.find(m => m.type === 'image')?.url;
      const { caption } = await suggestPostCaption({
        description: content,
        photoDataUri: firstImage
      });
      setContent(caption);
      toast({ title: "AI", description: "Caption suggested!" });
    } catch (error) {
      toast({ title: "AI Error", description: "Could not suggest caption.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline font-bold">Share something new</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="post">
                <MessageSquare className="w-4 h-4 mr-2" /> Community Post
              </TabsTrigger>
              <TabsTrigger value="business">
                <Briefcase className="w-4 h-4 mr-2" /> Business Update
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <div className="relative bg-muted rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center group min-h-[300px]">
                {mediaItems.length > 0 ? (
                  <div className="w-full p-4 grid grid-cols-2 gap-4">
                    {mediaItems.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-background group/item">
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <Image 
                            src={item.url} 
                            alt="Upload preview" 
                            fill 
                            className="object-cover" 
                            unoptimized 
                            style={{ transform: `scale(${item.zoom / 100})` }}
                          />
                        )}
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 rounded-full"
                          onClick={() => removeMedia(idx)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <label htmlFor="file-upload-more" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/20 transition-colors">
                      <ImagePlus className="w-8 h-8 text-muted-foreground opacity-40" />
                      <span className="text-[10px] font-bold mt-2 uppercase tracking-widest text-muted-foreground">Add More</span>
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
                  <div className="text-center space-y-4 p-8 w-full">
                    <div className="flex justify-center gap-6">
                      <ImagePlus className="w-12 h-12 text-muted-foreground opacity-20" />
                      <FileVideo className="w-12 h-12 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">High quality photos and videos</p>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                      <Button variant="secondary" size="sm" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer font-bold">
                          Select Files
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold">Write a caption</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSuggestCaption}
                    disabled={isSuggesting || mediaItems.length === 0}
                    className="text-primary hover:text-primary hover:bg-primary/10 font-bold"
                  >
                    {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    AI Suggest
                  </Button>
                </div>
                <Textarea 
                  placeholder="What's happening in Ethiopia?" 
                  className="min-h-[120px] text-lg"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex gap-3 border-t p-6">
          <Button variant="outline" className="flex-1 font-bold" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="flex-1 bg-primary font-bold" 
            onClick={handleCreatePost}
            disabled={isSubmitting || (mediaItems.length === 0 && !content.trim())}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Publish Post
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
      <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading creation hub...</div>}>
        <CreateContent />
      </Suspense>
    </div>
  );
}
