import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginFormContent from './login-form-content';

/**
 * Force dynamic rendering to prevent useSearchParams bailout during Vercel builds.
 */
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
