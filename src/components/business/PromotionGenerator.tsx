
'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { generatePromotionalText } from '@/ai/flows/generate-promotional-text-flow';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function PromotionGenerator() {
  const [loading, setLoading] = useState(false);
  const [promptData, setPromptData] = useState({
    businessName: '',
    category: '',
    offerings: '',
    cta: 'Visit us now!'
  });
  const [result, setResult] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerate = async () => {
    if (!promptData.businessName || !promptData.offerings) {
      toast({ title: "Error", description: "Please fill in business details.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { promotionalText } = await generatePromotionalText({
        businessName: promptData.businessName,
        businessCategory: promptData.category,
        productServiceDescription: promptData.offerings,
        callToAction: promptData.cta,
        lengthPreference: 'medium'
      });
      setResult(promotionalText);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate text.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Success", description: "Copied to clipboard!" });
  };

  const handlePostRedirect = () => {
    const encodedText = encodeURIComponent(result);
    router.push(`/create?text=${encodedText}&tab=business`);
  };

  return (
    <Card className="w-full bg-primary/5 border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-headline">
          <Sparkles className="w-5 h-5 fill-primary" />
          AI Promo Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Business Name</label>
            <Input 
              value={promptData.businessName}
              onChange={(e) => setPromptData({...promptData, businessName: e.target.value})}
              placeholder="e.g. Cafe Addis"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Category</label>
            <Input 
              value={promptData.category}
              onChange={(e) => setPromptData({...promptData, category: e.target.value})}
              placeholder="e.g. Cafe"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold">What are you promoting?</label>
          <Textarea 
            value={promptData.offerings}
            onChange={(e) => setPromptData({...promptData, offerings: e.target.value})}
            placeholder="Describe your special offer or event..."
          />
        </div>
        
        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Promotion Text
        </Button>

        {result && (
          <div className="mt-4 p-3 bg-card border rounded-md relative group space-y-3">
            <p className="text-sm italic text-foreground whitespace-pre-wrap">{result}</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={copyToClipboard}
              >
                <Copy className="w-3.5 h-3.5 mr-2" /> Copy
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1 text-xs bg-primary"
                onClick={handlePostRedirect}
              >
                <Send className="w-3.5 h-3.5 mr-2" /> Post Update
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
