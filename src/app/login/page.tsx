
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs';
import { Phone, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

export default function AuthPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
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
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="relative">
                      {method === 'email' ? (
                        <>
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Email address" className="pl-10 h-11" />
                        </>
                      ) : (
                        <>
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+251 911 22 33 44" className="pl-10 h-11" />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Password" className="pl-10 h-11" />
                    </div>
                    <div className="text-right">
                      <button className="text-[10px] text-primary font-bold hover:underline uppercase tracking-wider">Forgot password?</button>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90 h-11 group" asChild>
                    <Link href="/">
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Full Name" className="pl-10 h-11" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Email address" className="pl-10 h-11" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Create Password" className="pl-10 h-11" />
                  </div>
                  <Button className="w-full bg-primary h-11 group" asChild>
                    <Link href="/">
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
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
              <Button variant="outline" className="w-full border-border hover:bg-secondary/50">Google</Button>
              <Button variant="outline" className="w-full border-border hover:bg-secondary/50">Apple</Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest px-8">
          By joining, you agree to EthioConnect's <span className="text-primary font-bold">Terms</span> and <span className="text-primary font-bold">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
