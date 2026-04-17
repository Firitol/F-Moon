'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, ShieldCheck } from 'lucide-react';
import { PromotionGenerator } from '@/components/business/PromotionGenerator';

export default function BusinessDashboard() {
  const PLANS = [
    {
      name: 'Free',
      price: '0 ETB',
      features: ['Basic Profile', 'Post Updates', 'Standard Listing'],
      icon: <ShieldCheck className="w-6 h-6 text-muted-foreground" />,
      cta: 'Current Plan',
      primary: false
    },
    {
      name: 'Premium',
      price: '499 ETB / mo',
      features: ['Verified Badge', 'Promoted Posts', 'Featured Listing', 'Priority Support', 'AI Content Tools'],
      icon: <Crown className="w-6 h-6 text-primary" />,
      cta: 'Upgrade Now',
      primary: true
    },
    {
      name: 'Basic',
      price: '199 ETB / mo',
      features: ['Verified Badge', '3 Promoted Posts', 'Standard Listing'],
      icon: <Zap className="w-6 h-6 text-accent" />,
      cta: 'Get Started',
      primary: false
    }
  ];

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-headline font-bold text-primary animate-in fade-in slide-in-from-top-4 duration-700">Grow Your Business with F-Moon</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with thousands of potential customers in your local Ethiopian community.
            Boost your visibility with our powerful promotional tools.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 px-4">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col transition-all duration-300 hover:translate-y-[-8px] hover:shadow-2xl ${
                plan.primary ? 'border-primary ring-2 ring-primary/20 shadow-xl scale-105 z-10' : 'hover:border-primary/50'
              }`}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-secondary rounded-full w-fit group-hover:scale-110 transition-transform">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-3xl font-bold mt-2">{plan.price}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className={`w-full font-bold transition-all ${plan.primary ? 'bg-primary hover:bg-primary/90' : 'hover:bg-secondary'}`} variant={plan.primary ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        <section className="bg-card rounded-2xl p-8 border transition-all hover:shadow-lg">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-headline font-bold mb-4">Master Your Marketing</h2>
              <p className="text-muted-foreground mb-6">
                Use our AI-powered promotional text generator to create catchy, high-converting posts
                that resonate with the Ethiopian market.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary transition-transform group-hover:scale-150" /> 
                  <span className="group-hover:text-primary transition-colors">Save hours of creative writing</span>
                </li>
                <li className="flex items-center gap-2 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary transition-transform group-hover:scale-150" />
                  <span className="group-hover:text-primary transition-colors">Professional copy in seconds</span>
                </li>
                <li className="flex items-center gap-2 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary transition-transform group-hover:scale-150" />
                  <span className="group-hover:text-primary transition-colors">Optimized for local platforms</span>
                </li>
              </ul>
            </div>
            <div className="transition-transform hover:scale-[1.01]">
              <PromotionGenerator />
            </div>
          </div>
        </section>

        <section className="text-center space-y-8 py-12">
          <h3 className="text-2xl font-headline font-bold">Supported Ethiopian Payment Methods</h3>
          <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-20 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-md">Telebirr</div>
              <span className="text-xs font-medium">Telebirr</span>
            </div>
            <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-20 h-10 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-md">CBE BIRR</div>
              <span className="text-xs font-medium">CBE Birr</span>
            </div>
            <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-20 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs italic shadow-md">Chapa</div>
              <span className="text-xs font-medium">Chapa</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
