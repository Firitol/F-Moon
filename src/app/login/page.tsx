'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile 
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      router.push('/');
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      toast({ title: "Account created!", description: "Welcome to F-Moon." });
      router.push('/');
    } catch (error: any) {
      toast({ 
        title: "Registration Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: "Guest Access", description: "Exploring as a guest." });
      router.push('/');
    } catch (error: any) {
      toast({ 
        title: "Guest Access Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Logo className="justify-center" iconClassName="w-16 h-16" />
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Discover and connect with your Ethiopian community</p>
          </div>
        </div>

        <Card className="shadow-2xl border-none ring-1 ring-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-0 pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Join</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
                  <Button 
                    variant={method === 'email' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="flex-1 rounded-md transition-all h-8 text-xs"
                    onClick={() => setMethod('email')}
                  >
                    <Mail className="w-3.5 h-3.5 mr-2" /> Email
                  </Button>
                  <Button 
                    variant={method === 'phone' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="flex-1 rounded-md transition-all h-8 text-xs"
                    onClick={() => setMethod('phone')}
                    disabled
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone
                  </Button>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="email"
                        placeholder="Email address" 
                        autoComplete="username email"
                        className="pl-10 h-11" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="Password" 
                        autoComplete="current-password"
                        className="pl-10 h-11" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="text-right">
                      <button type="button" className="text-[10px] text-primary font-bold hover:underline uppercase tracking-wider">Forgot password?</button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 h-11 group" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sign In"}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-2">
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Full Name" 
                      autoComplete="name"
                      className="pl-10 h-11" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Email address" 
                      autoComplete="email"
                      className="pl-10 h-11" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="Create Password" 
                      autoComplete="new-password"
                      className="pl-10 h-11" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary h-11 group" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Account"}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardFooter className="flex flex-col gap-6 p-6 pt-8">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-card px-3">Or explore with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-secondary/50"
                onClick={handleAnonymousSignIn}
                disabled={isLoading}
              >
                Guest Access
              </Button>
              <Button variant="outline" className="w-full border-border hover:bg-secondary/50" disabled>
                Google
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest px-8">
          By joining, you agree to F-Moon's <span className="text-primary font-bold">Terms</span> and <span className="text-primary font-bold">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}