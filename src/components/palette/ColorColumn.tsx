"use client";

import React, { useState } from 'react';
import { Lock, Unlock, Copy, X, Edit2, Check } from 'lucide-react';
import { getBestTextColor, hexToRgb, hexToHsl } from '@/lib/color-utils';
import { usePalette } from '@/context/PaletteContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { copyToClipboard } from '@/lib/utils';

interface ColorColumnProps {
  index: number;
  hex: string;
  locked: boolean;
}

export const ColorColumn: React.FC<ColorColumnProps> = ({ index, hex, locked }) => {
  const { toggleLock, removeColor, updateColor } = usePalette();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(hex);

  const textColor = getBestTextColor(hex);
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast({
        title: "Copied!",
        description: `${text} copied to clipboard.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not access clipboard.",
      });
    }
  };

  const handleUpdate = () => {
    updateColor(index, editValue);
    setIsEditing(false);
  };

  return (
    <div 
      className="flex-1 w-full md:h-full relative group flex flex-col md:items-center justify-center p-4 md:p-6 color-column-transition"
      style={{ backgroundColor: hex }}
    >
      <div 
        className="flex flex-row md:flex-col items-center justify-between md:justify-center md:space-y-6 w-full h-full md:h-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ color: textColor }}
      >
        <div className="flex flex-row md:flex-col items-center gap-1 md:space-y-2 order-2 md:order-1 md:mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLock(index)}
            className="hover:bg-white/10 h-8 w-8 md:h-10 md:w-10"
            style={{ color: textColor }}
          >
            {locked ? <Lock className="w-4 h-4 md:w-6 md:h-6" /> : <Unlock className="w-4 h-4 md:w-6 md:h-6 opacity-40 group-hover:opacity-100" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeColor(index)}
            className="hover:bg-white/10 h-8 w-8 md:h-10 md:w-10"
            style={{ color: textColor }}
          >
            <X className="w-4 h-4 md:w-5 md:h-5 opacity-40 group-hover:opacity-100" />
          </Button>
        </div>

        <div className="flex flex-col items-start md:items-center gap-1 md:gap-4 text-left md:text-center order-1 md:order-2 flex-1 md:flex-none">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                className="w-24 md:w-28 text-sm md:text-base text-center bg-black/20 border-white/20 uppercase h-8 md:h-10"
                style={{ color: textColor }}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleUpdate} className="h-8 w-8">
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button 
              onClick={() => handleCopy(hex)}
              className="text-lg md:text-3xl font-black tracking-tighter uppercase hover:scale-105 transition-transform"
            >
              {hex}
            </button>
          )}

          <div className="text-[10px] md:text-xs font-mono opacity-60 space-y-0.5 md:space-y-1 hidden xs:block">
            <p className="hidden md:block">RGB({rgb.r}, {rgb.g}, {rgb.b})</p>
            <p className="hidden md:block">HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)</p>
            <p className="md:hidden">RGB {rgb.r} {rgb.g} {rgb.b}</p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-1 md:gap-2 order-3 md:order-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleCopy(hex)}
            className="hover:bg-white/10 h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs"
            style={{ color: textColor }}
          >
            <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="hover:bg-white/10 h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs"
            style={{ color: textColor }}
          >
            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
