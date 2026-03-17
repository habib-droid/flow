
"use client";

import React, { useEffect, useState } from 'react';
import { ColorColumn } from '@/components/palette/ColorColumn';
import { usePalette } from '@/context/PaletteContext';
import { Button } from '@/components/ui/button';
import { Plus, Download, Undo2, Redo2, HelpCircle, Sparkles, AlertCircle, Save, Loader2, Globe, Lock } from 'lucide-react';
import { generatePaletteFromPrompt } from '@/ai/flows/generate-palette-from-prompt';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function GeneratorPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { 
    palette, 
    generateNewPalette, 
    addColor, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    updateColor 
  } = usePalette();
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        generateNewPalette();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNewPalette, undo, redo]);

  const handleSavePalette = async () => {
    if (!user || !db) {
      router.push('/login?redirect=/');
      return;
    }

    setIsSaving(true);
    const paletteId = doc(collection(db, 'public_palettes')).id;
    
    const paletteData = {
      id: paletteId,
      userId: user.uid,
      name: `Palette ${new Date().toLocaleTimeString()}`,
      colors: palette.map(c => c.hex),
      isPublic: isPublic,
      likeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: ['AI', 'Generated'],
    };

    try {
      const userPaletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);
      await setDoc(userPaletteRef, paletteData);

      if (isPublic) {
        const publicPaletteRef = doc(db, 'public_palettes', paletteId);
        await setDoc(publicPaletteRef, paletteData);
      }

      toast({
        title: isPublic ? "Palette Published!" : "Palette Saved!",
        description: isPublic 
          ? "Your creation is now live for the community to see." 
          : "Your palette has been saved to your private profile.",
      });
      setSaveDialogOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while saving. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/');
      return;
    }
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAi(true);
    try {
      const result = await generatePaletteFromPrompt({ prompt: aiPrompt });
      result.palette.forEach((hex, idx) => {
        if (idx < palette.length) {
          updateColor(idx, hex);
        }
      });
      toast({
        title: "AI Palette Generated",
        description: result.reasoning,
      });
      setAiPrompt("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI palette.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col relative overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
        {palette.map((color, idx) => (
          <ColorColumn 
            key={idx} 
            index={idx} 
            hex={color.hex} 
            locked={color.locked} 
          />
        ))}
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 p-1.5 md:p-2 glass rounded-full shadow-2xl z-40 max-w-[95vw] overflow-x-auto no-scrollbar">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} className="h-8 w-8 md:h-10 md:w-10 rounded-full">
            <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="h-8 w-8 md:h-10 md:w-10 rounded-full">
            <Redo2 className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-white/10 mx-0.5 md:mx-1" />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-8 md:h-10 rounded-full gap-1.5 md:gap-2 px-3 md:px-6 hover:bg-primary/20 text-xs md:text-sm">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span className="hidden xs:inline">AI Prompt</span>
              <span className="xs:hidden">AI</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 sm:max-w-md w-[90vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                AI Palette Flow
              </DialogTitle>
            </DialogHeader>
            {!user ? (
              <div className="py-6 text-center space-y-4">
                <div className="flex justify-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <p className="text-muted-foreground">You need to be signed in to use AI features.</p>
                <Button onClick={() => router.push('/login?redirect=/')} className="w-full">Sign In to Continue</Button>
              </div>
            ) : (
              <form onSubmit={handleAiGenerate} className="space-y-4 pt-4">
                <Input 
                  placeholder="e.g., Luxury skincare brand, Retro 80s neon..." 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-white/5 border-white/10 h-12"
                />
                <Button type="submit" disabled={isGeneratingAi} className="w-full h-12">
                  {isGeneratingAi ? "Thinking..." : "Generate with AI"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Button 
          variant="secondary" 
          className="h-8 md:h-10 rounded-full gap-1.5 md:gap-2 px-4 md:px-6 shadow-lg shadow-primary/20 text-xs md:text-sm font-bold"
          onClick={generateNewPalette}
        >
          Generate
          <span className="hidden md:inline text-[10px] opacity-50 px-1.5 py-0.5 border border-white/20 rounded ml-2 font-mono">SPACE</span>
        </Button>

        <div className="w-px h-6 bg-white/10 mx-0.5 md:mx-1" />
        
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:h-10 md:w-10 rounded-full text-primary hover:bg-primary/10"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 w-[90vw]">
            <DialogHeader>
              <DialogTitle>Save & Share</DialogTitle>
              <DialogDescription>
                Store this palette. By default, it will be shared with the community.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <Label htmlFor="public-toggle" className="font-bold">Public Palette</Label>
                    <p className="text-xs text-muted-foreground">Visible to all users on Explore</p>
                  </div>
                </div>
                <Switch 
                  id="public-toggle" 
                  checked={isPublic} 
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSavePalette} 
                className="w-full h-12 gap-2" 
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isPublic ? "Publish Publicly" : "Save Privately"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={addColor} disabled={palette.length >= 10} className="h-8 w-8 md:h-10 md:w-10 rounded-full">
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full hidden xs:flex">
            <Download className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden xl:flex flex-col items-end gap-2 text-[10px] uppercase font-bold tracking-widest text-white/30">
        <p>Press space to generate</p>
        <p>L to lock color</p>
        <p>Click to copy hex</p>
      </div>
    </div>
  );
}
