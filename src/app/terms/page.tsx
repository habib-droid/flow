"use client";

import React, { useEffect, useState } from 'react';
import { ScrollText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <header className="mb-12">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <ScrollText className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs">
          Effective Date: {mounted ? new Date().toLocaleDateString() : '...'}
        </p>
      </header>

      <div className="space-y-12 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Palette Wave, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
          <p>
            Palette Wave is an AI-powered color palette generator. We provide tools for generating, exploring, and saving color combinations for creative projects.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
          <p>
            To use certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Intellectual Property</h2>
          <p>
            The palettes you generate are yours to use in your own projects. However, the Palette Wave platform, including its AI models, software, and original design elements, is the property of Palette Wave and its licensors.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Use the service for any illegal or unauthorized purpose.</li>
            <li>Attempt to reverse engineer or exploit the AI generation logic.</li>
            <li>Submit content that is offensive, harmful, or violates third-party rights.</li>
            <li>Automate data collection from the service (scraping) without permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Disclaimer of Warranties</h2>
          <p>
            The service is provided "as is" and "as available" without any warranties of any kind, either express or implied, including but not limited to the accuracy of AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
          <p>
            In no event shall Palette Wave be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.
          </p>
        </section>
      </div>
    </div>
  );
}
