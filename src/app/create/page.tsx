
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImagePlus, MessageSquare, Briefcase, Loader2, Sparkles, X } from 'lucide-react';
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
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleCreatePost = async () => {
    if (!user || !db) return;
    if (!content.trim() && !imageUrl) {
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
        imageUrl,
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
        photoDataUri: imageUrl || undefined
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
                  {imageUrl ? (
                    <>
                      <Image src={imageUrl} alt="Upload preview" fill className="object-cover" />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setImageUrl('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center space-y-2 p-8">
                      <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                      <p className="text-sm text-muted-foreground">Add a photo to make your post stand out</p>
                      <input 
                        type="text" 
                        placeholder="Paste image URL here..." 
                        className="text-xs p-2 border rounded w-full bg-background"
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
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
                      disabled={isSuggesting}
                      className="text-primary hover:text-primary hover:bg-primary/10"
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
