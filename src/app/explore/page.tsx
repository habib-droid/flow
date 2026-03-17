"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Copy, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, limit, doc, increment, serverTimestamp } from 'firebase/firestore';
import { copyToClipboard } from '@/lib/utils';

const MOCK_PALETTES = [
  { id: 'mock-1', colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'], name: 'Ocean Sunset', likeCount: 1240, tags: ['Warm', 'Vintage', 'All'] },
  { id: 'mock-2', colors: ['#003049', '#D62828', '#F77F00', '#FCBF49', '#EAE2B7'], name: 'Vintage Retro', likeCount: 890, tags: ['Vintage', 'Warm', 'All'] },
  { id: 'mock-3', colors: ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25'], name: 'Forest Cabin', likeCount: 2100, tags: ['Minimal', 'Cold', 'All'] },
  { id: 'mock-4', colors: ['#335C67', '#FFF3B0', '#E09F3E', '#9E2A2B', '#540B0E'], name: 'Autumn Chill', likeCount: 540, tags: ['Warm', 'Vintage', 'All'] },
  { id: 'mock-5', colors: ['#2E3440', '#3B4252', '#434C5E', '#4C566A', '#D8DEE9'], name: 'Nordic Night', likeCount: 3100, tags: ['Cold', 'Minimal', 'All'] },
  { id: 'mock-6', colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC'], name: 'Lavender Mist', likeCount: 1560, tags: ['Pastel', 'Warm', 'All'] },
  { id: 'mock-7', colors: ['#004D40', '#00695C', '#00796B', '#00897B', '#009688'], name: 'Emerald Forest', likeCount: 2400, tags: ['Cold', 'Minimal', 'All'] },
  { id: 'mock-8', colors: ['#FFB74D', '#FFA726', '#FB8C00', '#F57C00', '#EF6C00'], name: 'Golden Hour', likeCount: 4200, tags: ['Warm', 'Neon', 'All'] },
  { id: 'mock-9', colors: ['#1A1A1D', '#4E4E50', '#6F2232', '#950740', '#C3073F'], name: 'Cyberpunk Red', likeCount: 5800, tags: ['Neon', 'Vintage', 'All'] },
];

const CATEGORIES = ['All', 'Pastel', 'Vintage', 'Minimal', 'Neon', 'Warm', 'Cold', 'AI'];

export default function ExplorePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/explore');
    }
  }, [user, isUserLoading, router]);

  const publicPalettesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'public_palettes'), orderBy('likeCount', 'desc'), limit(50));
  }, [db]);

  const { data: firebasePalettes, isLoading: isPalettesLoading } = useCollection(publicPalettesQuery);

  const allPalettes = useMemo(() => {
    const firestoreData = firebasePalettes || [];
    return [...firestoreData, ...MOCK_PALETTES];
  }, [firebasePalettes]);

  const filteredPalettes = useMemo(() => {
    return allPalettes.filter(palette => {
      const matchesCategory = activeCategory === 'All' || 
        (palette.tags && palette.tags.some((tag: string) => tag.toLowerCase() === activeCategory.toLowerCase()));
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        palette.name?.toLowerCase().includes(searchLower) ||
        (palette.tags && palette.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) ||
        (palette.colors && palette.colors.some((color: string) => color.toLowerCase().includes(searchLower)));

      return matchesCategory && matchesSearch;
    });
  }, [allPalettes, activeCategory, searchQuery]);

  const handleCopy = async (hex: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      toast({ title: "Copied!", description: `${hex} copied to clipboard.` });
    } else {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not access clipboard." });
    }
  };

  const handleLike = (paletteId: string) => {
    if (!user || !db) {
      router.push('/login?redirect=/explore');
      return;
    }

    if (paletteId.startsWith('mock-')) {
      toast({ title: "Mock Interaction", description: "You can only like palettes published by real users." });
      return;
    }

    const userLikeRef = doc(db, 'users', user.uid, 'likedPalettes', paletteId);
    setDocumentNonBlocking(userLikeRef, {
      id: paletteId,
      userId: user.uid,
      paletteId: paletteId,
      createdAt: serverTimestamp(),
    }, { merge: true });

    const publicPaletteRef = doc(db, 'public_palettes', paletteId);
    updateDocumentNonBlocking(publicPaletteRef, {
      likeCount: increment(1)
    });

    const targetPalette = firebasePalettes?.find(p => p.id === paletteId);
    if (targetPalette?.userId) {
      const ownerPaletteRef = doc(db, 'users', targetPalette.userId, 'palettes', paletteId);
      updateDocumentNonBlocking(ownerPaletteRef, {
        likeCount: increment(1)
      });
    }

    toast({ title: "Liked!", description: "Stats updated across the platform." });
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Explore Palettes</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Discover professional color combinations from the community. Like your favorites to save them to your profile.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/5 border-white/10 rounded-full" 
              placeholder="Search by name, color, or tags..." 
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Badge 
                key={cat} 
                variant={activeCategory === cat ? "default" : "secondary"}
                className="px-4 py-1.5 rounded-full cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {isPalettesLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Syncing community gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPalettes.length > 0 ? (
            filteredPalettes.map(palette => (
              <Card key={palette.id} className="group overflow-hidden glass border-white/5 hover:border-primary/50 transition-all duration-300">
                <div className="h-32 flex">
                  {palette.colors?.map((color: string) => (
                    <div 
                      key={color} 
                      className="flex-1 cursor-pointer hover:flex-[1.5] transition-all duration-300 relative group/color"
                      style={{ backgroundColor: color }}
                      onClick={() => handleCopy(color)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                  ))}
                </div>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm truncate max-w-[150px]">{palette.name || "Untitled"}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                      {(palette.likeCount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full hover:bg-rose-500/10 hover:text-rose-500"
                      onClick={() => handleLike(palette.id)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass border-dashed border-white/10 rounded-3xl">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <h3 className="text-xl font-bold mb-2">Nothing found here</h3>
              <p className="text-muted-foreground">Try a different search or publishing your own palette!</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-12 text-center">
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-full px-12 h-12 border-white/10 hover:bg-white/5">
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          Create Your Own Palette
        </Button>
      </div>
    </div>
  );
}
