"use client";

import Link from 'next/link';
import { Palette } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-background/50 backdrop-blur-sm py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Palette className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tighter">Palette Wave</span>
          </Link>
        </div>
        
        <div className="text-muted-foreground text-sm flex justify-center">
          © {new Date().getFullYear()} Palette Wave. All rights reserved.
        </div>

        <div className="flex justify-center md:justify-end text-sm text-muted-foreground">
          Powered by <a href="https://wpminner.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1 font-medium">wpminner.com</a>
        </div>
      </div>
    </footer>
  );
};
