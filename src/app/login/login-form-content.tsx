"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SUPER_ADMIN_EMAIL = 'nooriservices01@gmail.com';

/**
 * Surgical fix: Isolated component to handle search params to avoid pre-render bailout.
 */
function SearchParamsHandler({ setRedirectPath }: { setRedirectPath: (path: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const path = searchParams.get('redirect') || '/';
    setRedirectPath(path);
  }, [searchParams, setRedirectPath]);
  return null;
}

export default function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace(redirectPath);
    }
  }, [user, isUserLoading, router, redirectPath]);

  const handleAuth = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields.' });
      return;
    }
    
    setIsLoading(true);
    try {
      if (type === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "Successfully signed in." });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const role = newUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

        const userRef = doc(db, 'users', newUser.uid);
        await setDoc(userRef, {
          id: newUser.uid,
          email: newUser.email,
          username: newUser.email?.split('@')[0] || 'User',
          preferredTheme: 'dark',
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast({
          title: role === 'admin' ? "Super Admin Registered" : "Account Created",
          description: "Welcome to Palette Wave!",
        });
      }
      
      router.replace(redirectPath);
      
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Authentication Failed', description: error.message });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter your email address.' });
      return;
    }
    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for password reset instructions.",
      });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Reset Failed', description: error.message });
    } finally {
      setIsResetLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-6">
      {/* Surgical fix: Wrap the search params handler in its own Suspense */}
      <Suspense fallback={null}>
        <SearchParamsHandler setRedirectPath={setRedirectPath} />
      </Suspense>

      <Card className="w-full max-w-md glass border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4">
            <Palette className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Welcome to Palette Wave</CardTitle>
          <CardDescription>
            Join our community to unlock AI features and save your palettes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={(e) => handleAuth(e, 'signin')} className="space-y-4">
                <div className="space-y-2 relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 pl-10"
                    required
                  />
                </div>
                <div className="space-y-2 relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="px-0 h-auto text-xs text-muted-foreground hover:text-primary">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/10">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
                        <Input 
                          type="email" 
                          placeholder="your@email.com" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="bg-white/5 border-white/10"
                          required
                        />
                        <Button type="submit" className="w-full" disabled={isResetLoading}>
                          {isResetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Send Reset Link
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button 
                  type="submit"
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuth(e, 'signup')} className="space-y-4">
                <div className="space-y-2 relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 pl-10"
                    required
                  />
                </div>
                <div className="space-y-2 relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button 
                  type="submit"
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
