
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary italic">EthioConnect</h1>
          <p className="text-muted-foreground">Discover and connect with your community</p>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader className="pb-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant={method === 'email' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setMethod('email')}
                  >
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </Button>
                  <Button 
                    variant={method === 'phone' ? 'default' : 'outline'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setMethod('phone')}
                  >
                    <Phone className="w-4 h-4 mr-2" /> Phone
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    {method === 'email' ? (
                      <>
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Email address" className="pl-10" />
                      </>
                    ) : (
                      <>
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="+251 911 22 33 44" className="pl-10" />
                      </>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password" className="pl-10" />
                  </div>
                  <Button className="w-full bg-primary" asChild>
                    <Link href="/">Sign In</Link>
                  </Button>
                  <div className="text-center">
                    <button className="text-xs text-primary font-bold hover:underline">Forgot password?</button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Full Name" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Email address" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="+251 9..." className="pl-10" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Create Password" className="pl-10" />
                  </div>
                  <Button className="w-full bg-primary" asChild>
                    <Link href="/">Create Account</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4 p-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" className="w-full">Google</Button>
              <Button variant="outline" className="w-full">Facebook</Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to EthioConnect's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
