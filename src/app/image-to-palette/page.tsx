"use client";

import React, { useState, useEffect } from 'react';
import { Upload, ImageIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractPaletteFromImage } from '@/ai/flows/extract-palette-from-image';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function ImageToPalettePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/image-to-palette');
    }
  }, [user, isUserLoading, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!image) return;
    setIsExtracting(true);
    try {
      const result = await extractPaletteFromImage({ photoDataUri: image, numberOfColors: 5 });
      setExtractedColors(result.colors);
      setReasoning(result.reasoning);
      toast({ title: "Success!", description: "Colors extracted successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Extraction Failed", description: "Could not analyze the image." });
    } finally {
      setIsExtracting(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Image to Palette</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Upload an image and let our AI extract the most beautiful dominant colors to create a custom palette.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="aspect-video glass border-dashed border-white/20 flex flex-col items-center justify-center p-8 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-all">
            {image ? (
              <img src={image} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold">Drop your image here</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or WebP (Max 5MB)</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Card>

          <Button 
            className="w-full h-12 gap-2 text-lg rounded-xl" 
            disabled={!image || isExtracting}
            onClick={handleExtract}
          >
            {isExtracting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Extract Palette</>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="glass border-white/10 min-h-[300px]">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Extracted Palette
              </h3>

              {extractedColors.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-24 flex rounded-2xl overflow-hidden shadow-2xl">
                    {extractedColors.map(color => (
                      <div 
                        key={color} 
                        className="flex-1 hover:flex-[1.5] transition-all duration-300 relative group/col"
                        style={{ backgroundColor: color }}
                      >
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover/col:opacity-100 transition-opacity drop-shadow">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                      "{reasoning}"
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 rounded-xl">Save as Collection</Button>
                    <Button className="flex-1 rounded-xl">Open in Generator</Button>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-10" />
                  <p>Upload and extract colors to see the magic happen.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
