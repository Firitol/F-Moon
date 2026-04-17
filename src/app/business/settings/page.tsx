
'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Shield, User, Briefcase, HelpCircle, Save } from 'lucide-react';

export default function BusinessSettings() {
  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-8">
        <header>
          <h1 className="text-3xl font-headline font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your business profile and preferences.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-bold">
              <Briefcase className="w-4 h-4 mr-2" /> Business Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Shield className="w-4 h-4 mr-2" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <HelpCircle className="w-4 h-4 mr-2" /> Help & Support
            </Button>
          </aside>

          <div className="md:col-span-3 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Public Information</CardTitle>
                <CardDescription>This information will be visible to everyone on F-Moon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input defaultValue="Addis Luxury Suites" />
                  </div>
                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Textarea defaultValue="The finest stay in the heart of Addis Ababa." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input defaultValue="Hotel" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input defaultValue="+251 911 223344" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Preferences</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Contact</Label>
                      <p className="text-xs text-muted-foreground">Allow users to see your phone number on your profile.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accept Inquiries</Label>
                      <p className="text-xs text-muted-foreground">Receive direct messages from potential customers.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardContent className="border-t pt-6">
                <Button className="bg-primary font-bold">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your business listing.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Deactivate Business Listing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
