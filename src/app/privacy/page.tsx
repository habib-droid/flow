"use client";

import React, { useEffect, useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs">
          Last Updated: {mounted ? new Date().toLocaleDateString() : '...'}
        </p>
      </header>

      <div className="space-y-12 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
          <p>
            Palette Wave collects minimal information to provide our color palette generation services. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Account Data:</strong> Email address and username provided during registration.</li>
            <li><strong>User Content:</strong> Color palettes and collections you explicitly save to your profile.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with the app, such as pages visited and features used.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
          <p>We use the collected data to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Provide and maintain the Palette Wave service.</li>
            <li>Personalize your experience (e.g., saving your favorite palettes).</li>
            <li>Communicate with you regarding your account or support requests.</li>
            <li>Improve our AI generation models based on aggregated, non-identifiable usage patterns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using <strong>Google Firebase</strong>. We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Third-Party Services</h2>
          <p>Palette Wave utilizes third-party services for core functionality:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Google Firebase:</strong> For authentication, database storage, and hosting.</li>
            <li><strong>Google Gemini AI:</strong> For processing natural language prompts and image analysis.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time through your account settings. For full account deletion, please contact our support team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
        </section>
      </div>
    </div>
  );
}
