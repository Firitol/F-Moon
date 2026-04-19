
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Phone, Mail, Lock, User, ArrowRight, Loader2, MapPin, AlignLeft, Send } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ 
        title: "Email Required", 
        description: "Please enter your email address to reset your password.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ 
        title: "Reset Link Sent", 
        description: `Instructions have been sent to ${resetEmail}. Please check your inbox and spam folder.` 
      });
      setIsResetOpen(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message === 'auth/user-not-found' 
          ? "No account found with this email." 
          : error.message, 
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
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      if (db) {
        const timestamp = new Date().toISOString();
        await setDoc(doc(db, 'public_user_profiles', user.uid), {
          id: user.uid,
          userId: user.uid,
          name: displayName,
          email: user.email,
          location: location || 'Addis Ababa, Ethiopia',
          bio: bio || 'Welcome to my F-Moon profile!',
          profilePictureUrl: '',
          createdAt: timestamp,
          followerCount: 0,
          followingCount: 0,
          friendCount: 0
        }, { merge: true });

        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: displayName,
          email: user.email,
          role: 'NormalUser',
          status: 'active',
          avatar: '',
          createdAt: timestamp
        }, { merge: true });
      }

      toast({ title: "Account created!", description: "Welcome to F-Moon community." });
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (db) {
        const timestamp = new Date().toISOString();
        await setDoc(doc(db, 'public_user_profiles', user.uid), {
          id: user.uid,
          userId: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          location: 'Addis Ababa, Ethiopia',
          bio: 'Welcome to my F-Moon profile!',
          profilePictureUrl: user.photoURL || '',
          createdAt: timestamp,
          followerCount: 0,
          followingCount: 0,
          friendCount: 0
        }, { merge: true });

        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          role: 'NormalUser',
          status: 'active',
          avatar: user.photoURL || '',
          createdAt: timestamp
        }, { merge: true });
      }

      toast({ title: "Welcome!", description: `Signed in as ${user.displayName}` });
      router.push('/');
    } catch (error: any) {
      toast({ 
        title: "Google Sign-In Failed", 
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
            <h1 className="text-3xl font-headline font-bold">F-Moon Ethiopia</h1>
            <p className="text-muted-foreground text-sm">Discover and connect with your local community</p>
          </div>
        </div>

        <Card className="shadow-2xl border-none ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-0 pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Join F-Moon</TabsTrigger>
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
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone
                  </Button>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1">
                    {method === 'email' ? (
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
                    ) : (
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="tel"
                          placeholder="+251 ..." 
                          className="pl-10 h-11" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    )}
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
                      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                        <DialogTrigger asChild>
                          <button 
                            type="button" 
                            className="text-[10px] text-primary font-bold hover:underline uppercase tracking-wider disabled:opacity-50"
                            disabled={isLoading}
                          >
                            Forgot password?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-headline">Reset Password</DialogTitle>
                            <DialogDescription>
                              Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="email" 
                                placeholder="Email address" 
                                value={resetEmail} 
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                className="w-full bg-primary font-bold" 
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Reset Link
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
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

              <TabsContent value="register" className="space-y-4">
                <p className="text-xs text-muted-foreground font-medium text-center mb-2 italic">Tell us a bit about yourself to join the F-Moon community.</p>
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
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Location (e.g. Addis Ababa, Bole)" 
                      className="pl-10 h-11" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      placeholder="Short Bio - What brings you to F-Moon?" 
                      className="pl-10 pt-2 min-h-[80px]" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
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
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-secondary/50" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Google"}
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
