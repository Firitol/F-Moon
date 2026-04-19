
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
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
import { Phone, Mail, Lock, User, ArrowRight, Loader2, MapPin, AlignLeft, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function AuthPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset Password States
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  
  // Registration Phone Verification States
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!recaptchaVerifierRef.current && auth) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        'callback': () => {
          console.log('Recaptcha verified');
        }
      });
    }
  }, [auth]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      router.push('/');
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (resetMethod === 'email') {
        if (!resetEmail) throw new Error("Please enter your email.");
        await sendPasswordResetEmail(auth, resetEmail);
        toast({ 
          title: "Email Sent", 
          description: "Check your Inbox and Spam/Junk folder for the reset link." 
        });
        setIsResetOpen(false);
      } else {
        if (!resetPhone) throw new Error("Please enter your phone.");
        if (!resetPhone.startsWith('+')) throw new Error("Please use international format: +251...");
        
        if (!recaptchaVerifierRef.current) throw new Error("System is initializing, please try again.");
        
        const result = await signInWithPhoneNumber(auth, resetPhone, recaptchaVerifierRef.current);
        setConfirmationResult(result);
        setIsOtpSent(true);
        toast({ title: "OTP Sent", description: `A 6-digit code was sent to ${resetPhone}` });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !resetOtp) return;

    setIsLoading(true);
    try {
      await confirmationResult.confirm(resetOtp);
      toast({ title: "Verified", description: "Phone verified! You are now logged in and can update your password in Settings." });
      setIsResetOpen(false);
      router.push('/');
    } catch (error: any) {
      toast({ title: "Verification Failed", description: "Invalid code. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName || !phone) {
       toast({ title: "Missing Info", description: "Please fill all required fields.", variant: "destructive" });
       return;
    }

    if (!phone.startsWith('+')) {
      toast({ title: "Invalid Format", description: "Phone must start with + (e.g., +251...)", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (!recaptchaVerifierRef.current) throw new Error("System initializing...");
      const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setShowOtpField(true);
      toast({ title: "Code Sent", description: "Please enter the 6-digit verification code." });
    } catch (error: any) {
      toast({ title: "Failed to Send Code", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !verificationCode) return;

    setIsLoading(true);
    try {
      // 1. Confirm Phone
      await confirmationResult.confirm(verificationCode);
      
      // 2. Create Email Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Update Profile
      await updateProfile(user, { displayName });

      if (db) {
        const timestamp = new Date().toISOString();
        const profileData = {
          id: user.uid,
          userId: user.uid,
          name: displayName,
          email: user.email,
          phone: phone,
          location: location || 'Addis Ababa, Ethiopia',
          bio: bio || 'Welcome to my F-Moon profile!',
          profilePictureUrl: '',
          createdAt: timestamp,
          followerCount: 0,
          followingCount: 0,
          friendCount: 0
        };

        await setDoc(doc(db, 'public_user_profiles', user.uid), profileData, { merge: true });
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

      toast({ title: "Welcome to F-Moon!", description: "Account created and phone verified." });
      router.push('/');
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
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
      toast({ title: "Google Login Failed", description: error.message, variant: "destructive" });
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
      toast({ title: "Guest Access Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div id="recaptcha-container" className="fixed bottom-0"></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Logo className="justify-center" iconClassName="w-16 h-16" />
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-primary">F-Moon Ethiopia</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Discover & Connect</p>
          </div>
        </div>

        <Card className="shadow-2xl border-none ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-0 pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg">Join</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
                  <Button 
                    variant={loginMethod === 'email' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => setLoginMethod('email')}
                  >
                    <Mail className="w-3.5 h-3.5 mr-2" /> Email
                  </Button>
                  <Button 
                    variant={loginMethod === 'phone' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => setLoginMethod('phone')}
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone
                  </Button>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-4">
                    {loginMethod === 'email' ? (
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email"
                          placeholder="Email address" 
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
                          placeholder="+251..." 
                          className="pl-10 h-11" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="Password" 
                        className="pl-10 h-11" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Dialog open={isResetOpen} onOpenChange={(open) => {
                      setIsResetOpen(open);
                      if (!open) setIsOtpSent(false);
                    }}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[10px] text-primary font-bold hover:underline uppercase tracking-wider">
                          Forgot password?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Account Recovery</DialogTitle>
                          <DialogDescription>Choose how you want to recover your access.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                          <RadioGroup value={resetMethod} onValueChange={(v: any) => {
                            setResetMethod(v);
                            setIsOtpSent(false);
                          }} className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value="email" id="reset-email" />
                              <Label htmlFor="reset-email" className="cursor-pointer">Email Link</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value="phone" id="reset-phone" />
                              <Label htmlFor="reset-phone" className="cursor-pointer">Phone SMS</Label>
                            </div>
                          </RadioGroup>

                          {!isOtpSent ? (
                            <div className="space-y-4">
                              {resetMethod === 'email' ? (
                                <div className="space-y-2">
                                  <Label>Your Account Email</Label>
                                  <Input placeholder="example@gmail.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label>Registered Phone Number</Label>
                                  <Input placeholder="+251..." value={resetPhone} onChange={(e) => setResetPhone(e.target.value)} />
                                  <p className="text-[10px] text-muted-foreground italic">Must include country code (e.g. +251)</p>
                                </div>
                              )}
                              <Button className="w-full bg-primary" onClick={handleSendResetCode} disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Reset Verification
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Label className="text-center block">Enter 6-digit code sent to {resetPhone}</Label>
                              <Input placeholder="0 0 0 0 0 0" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} className="text-center tracking-[1em] font-bold text-xl h-12" maxLength={6} />
                              <div className="flex flex-col gap-2">
                                <Button className="w-full bg-primary" onClick={handleVerifyResetOtp} disabled={isLoading}>
                                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                  Verify & Log In
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsOtpSent(false)} className="text-xs">
                                  <RefreshCw className="w-3 h-3 mr-2" /> Re-enter number or Resend
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button type="submit" className="w-full bg-primary h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                {!showOtpField ? (
                  <form onSubmit={handleStartRegistration} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Full Name" className="pl-10 h-11" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="Email address" className="pl-10 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="tel" placeholder="+251..." className="pl-10 h-11" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Password" className="pl-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Location (e.g. Addis Ababa)" className="pl-10 h-11" value={location} onChange={(e) => setLocation(e.target.value)} />
                      </div>
                      <div className="relative">
                        <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea placeholder="Short Bio" className="pl-10 pt-2 h-20" value={bio} onChange={(e) => setBio(e.target.value)} />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-primary h-11" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify Phone & Join"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleCompleteRegistration} className="space-y-6 py-4">
                    <div className="text-center space-y-2">
                      <h3 className="font-bold">Verify your Phone</h3>
                      <p className="text-xs text-muted-foreground">We sent a 6-digit code to {phone}</p>
                    </div>
                    <Input 
                      placeholder="0 0 0 0 0 0" 
                      className="text-center text-2xl tracking-[0.5em] font-bold h-14" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      maxLength={6}
                    />
                    <div className="flex flex-col gap-2">
                      <Button type="submit" className="w-full bg-primary h-11" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Complete Registration"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowOtpField(false)} disabled={isLoading}>
                        Change Number or Resend
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardFooter className="flex flex-col gap-6 p-6 pt-8">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-card px-3">Quick Social Access</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" className="w-full h-11" onClick={handleAnonymousSignIn} disabled={isLoading}>
                Guest
              </Button>
              <Button variant="outline" className="w-full h-11 border-primary text-primary hover:bg-primary/5" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Google"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
