"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContrastRatio, getWCAGStatus } from '@/lib/color-utils';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function ContrastCheckerPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [foreground, setForeground] = useState("#FFFFFF");
  const [background, setBackground] = useState("#8B68D1");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/contrast-checker');
    }
  }, [user, isUserLoading, router]);

  const ratio = getContrastRatio(foreground, background);
  const status = getWCAGStatus(ratio);

  if (isUserLoading || !user) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Contrast Checker</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-lg max-w-xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <p>
            Ensure your designs are accessible to everyone. Check WCAG compliance for text contrast.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="glass border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold mb-4">Text Color (Foreground)</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 shadow-lg shrink-0" style={{ backgroundColor: foreground }} />
                <Input value={foreground} onChange={(e) => setForeground(e.target.value)} className="uppercase font-mono" />
              </div>

              <h3 className="font-bold pt-4 mb-4">Background Color</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 shadow-lg shrink-0" style={{ backgroundColor: background }} />
                <Input value={background} onChange={(e) => setBackground(e.target.value)} className="uppercase font-mono" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contrast Ratio</span>
                <span className="text-4xl font-black text-primary">{ratio.toFixed(2)}:1</span>
              </div>

              <div className="space-y-4">
                <ResultRow label="Normal Text" pass={status.AA} sub="AA (4.5:1)" />
                <ResultRow label="Normal Text" pass={status.AAA} sub="AAA (7.0:1)" />
                <ResultRow label="Large Text" pass={status.largeAA} sub="AA (3.0:1)" />
                <ResultRow label="Large Text" pass={status.largeAAA} sub="AAA (4.5:1)" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full overflow-hidden transition-all duration-500 border-none" style={{ backgroundColor: background, color: foreground }}>
            <CardContent className="p-12 space-y-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] mb-4 opacity-60">Sample Text Preview</p>
                <h2 className="text-5xl font-black leading-tight tracking-tighter">
                  Accessibility makes design for everyone.
                </h2>
              </div>
              <p className="text-xl leading-relaxed">
                Modern web standards require that foreground and background colors provide enough contrast so that they can be read by people with moderately low vision.
              </p>
              <div className="pt-8 border-t border-current opacity-20">
                <p className="text-xs font-mono uppercase">WCAG 2.1 Guidelines Compliance • {ratio.toFixed(2)}:1 Contrast Ratio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, pass, sub }: { label: string, pass: boolean, sub: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
      {pass ? (
        <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 rounded-full px-3">
          <CheckCircle2 className="w-3 h-3" /> PASS
        </Badge>
      ) : (
        <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border-rose-500/30 gap-1 rounded-full px-3">
          <XCircle className="w-3 h-3" /> FAIL
        </Badge>
      )}
    </div>
  );
}
