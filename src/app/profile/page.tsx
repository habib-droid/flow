"use client";

import React, { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Palette as PaletteIcon, 
  Heart, 
  Loader2, 
  Settings,
  ArrowRight,
  Copy,
  RefreshCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch User Profile
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // Fetch User's Saved Palettes
  const palettesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'palettes'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);
  const { data: palettes, isLoading: isPalettesLoading } = useCollection(palettesQuery);

  // Fetch User's Liked Palettes (Real-time listener)
  const likedPalettesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'likedPalettes'));
  }, [db, user?.uid]);
  const { data: likedPalettes, isLoading: isLikesLoading } = useCollection(likedPalettesQuery);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isUserLoading, router]);

  const handleCopy = async (hex: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      toast({ title: "Copied!", description: `${hex} copied to clipboard.` });
    } else {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not access clipboard." });
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-2xl relative">
            <UserIcon className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{profile?.username || user.email?.split('@')[0]}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-sm">
                <Mail className="w-4 h-4" /> {user.email}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Shield className="w-4 h-4 text-primary" /> {profile?.role || 'User'}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4" /> Joined {profile?.createdAt instanceof Timestamp ? profile.createdAt.toDate().toLocaleDateString() : 'recently'}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="rounded-full gap-2 h-11 px-6 border-white/10 hover:bg-white/5">
          <Settings className="w-4 h-4" /> Account Settings
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Stats Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center relative group">
                  {isPalettesLoading && <RefreshCcw className="absolute top-2 right-2 w-3 h-3 animate-spin opacity-50" />}
                  <p className="text-2xl font-black text-primary">{palettes?.length || 0}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">My Palettes</p>
                </div>
                <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-center relative group">
                  {isLikesLoading && <RefreshCcw className="absolute top-2 right-2 w-3 h-3 animate-spin opacity-50" />}
                  <p className="text-2xl font-black text-rose-500">{likedPalettes?.length || 0}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">My Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Privacy Info</CardTitle>
              <CardDescription>Your account security details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-muted-foreground">ID</span>
                  <span className="text-[10px] font-mono opacity-40">{user.uid}</span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-5">Verified</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <PaletteIcon className="w-6 h-6 text-primary" />
                My Collection
              </h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-primary hover:text-primary hover:bg-primary/10 gap-2">
                Generate More <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {isPalettesLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading your gallery...</p>
              </div>
            ) : palettes && palettes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {palettes.map((p: any) => (
                  <Card key={p.id} className="glass border-white/5 overflow-hidden group hover:border-primary/50 transition-all duration-300">
                    <div className="h-24 flex">
                      {p.colors?.map((color: string, i: number) => (
                        <div 
                          key={i} 
                          className="flex-1 cursor-pointer hover:flex-[1.2] transition-all relative group/color"
                          style={{ backgroundColor: color }}
                          onClick={() => handleCopy(color)}
                        >
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
                            <Copy className="w-4 h-4 text-white drop-shadow" />
                          </span>
                        </div>
                      ))}
                    </div>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm truncate max-w-[150px]">{p.name || "Untitled"}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            {p.createdAt instanceof Timestamp ? p.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </p>
                          {p.isPublic && <Badge className="text-[8px] h-4 bg-primary/10 text-primary border-primary/20">Public</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                        <Heart className="w-3 h-3 fill-current" />
                        {p.likeCount || 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center glass border-dashed border-white/10 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                  <PaletteIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">No palettes yet</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                  Your creative journey starts here. Save your first combination in the generator!
                </p>
                <Button onClick={() => router.push('/')} className="rounded-full px-8">Go to Generator</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
