
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CreatePage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('post');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !db) return;
    if (!content.trim() && !mediaUrl) {
      toast({ title: "Error", description: "Please add some content.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        userName: user.displayName || 'User',
        userAvatar: user.photoURL || '',
        content,
        imageUrl: mediaType === 'image' ? mediaUrl : '',
        videoUrl: mediaType === 'video' ? mediaUrl : '',
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
    setIsSuggesting(true);
    try {
      const { caption } = await suggestPostCaption({
        description: content,
        photoDataUri: (mediaType === 'image' && mediaUrl) ? mediaUrl : undefined
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
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
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
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center group">
                  {mediaUrl ? (
                    <>
                      {mediaType === 'video' ? (
                        <video src={mediaUrl} controls className="w-full h-full object-cover" />
                      ) : (
                        <Image src={mediaUrl} alt="Upload preview" fill className="object-cover" unoptimized />
                      )}
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => { setMediaUrl(''); setMediaType(null); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center space-y-4 p-8">
                      <div className="flex justify-center gap-6">
                        <ImagePlus className="w-12 h-12 text-muted-foreground opacity-20" />
                        <FileVideo className="w-12 h-12 text-muted-foreground opacity-20" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Browse your device to upload</p>
                        <input 
                          type="file" 
                          accept="image/*,video/*" 
                          id="file-upload" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                        <Button variant="secondary" size="sm" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            Choose Photo or Video
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
                      disabled={isSuggesting || (mediaType === 'video')}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {mediaType === 'video' ? 'AI Suggest (Photos only)' : 'AI Suggest'}
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
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
            <Button 
              className="flex-1 bg-primary font-bold" 
              onClick={handleCreatePost}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Publish Post
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
