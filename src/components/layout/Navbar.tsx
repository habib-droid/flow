"use client";

import Link from 'next/link';
import { Palette, Search, Image as ImageIcon, Zap, ShieldCheck, User, LogOut, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetClose, SheetTitle } from '@/components/ui/sheet';

const SUPER_ADMIN_EMAIL = 'nooriservices01@gmail.com';

export const Navbar = () => {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  const handleSignOut = () => {
    signOut(auth);
  };

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass flex items-center justify-between px-2 md:px-4 lg:px-6 border-b border-white/5">
      <div className="flex items-center gap-4 lg:gap-8">


        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Palette className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tighter whitespace-nowrap">Palette Wave</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" className="gap-2 h-9">
              <Zap className="w-4 h-4" /> Generator
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="gap-2 h-9">
              <Search className="w-4 h-4" /> Explore
            </Button>
          </Link>
          <Link href="/image-to-palette">
            <Button variant="ghost" className="gap-2 h-9">
              <ImageIcon className="w-4 h-4" /> Image
            </Button>
          </Link>
          <Link href="/contrast-checker">
            <Button variant="ghost" className="gap-2 h-9">
              <ShieldCheck className="w-4 h-4" /> Contrast
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" className="gap-2 h-9 text-primary hover:text-primary hover:bg-primary/10">
                <LayoutDashboard className="w-4 h-4" /> Admin
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile: hamburger + compact sign-in (visible on small screens only) */}
        <div className="flex items-center gap-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="p-2">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="glass p-4 shadow-md"
              style={{
                top: "4rem", // matches navbar height (h-16)
                left: 0,
                height: "calc(100vh - 4rem)",
                width: "50vw",
                maxWidth: "50vw",
              }}
            >
              <SheetHeader className="flex items-center justify-between">
                <SheetTitle className="font-medium">Menu</SheetTitle>
              </SheetHeader>

              <nav className="mt-4 flex flex-col gap-3">
                <Link href="/" className="py-2 px-3">Home</Link>
                <Link href="/" className="py-2 px-3">Generator</Link>
                <Link href="/explore" className="py-2 px-3">Explore</Link>
                <Link href="/image-to-palette" className="py-2 px-3">Image</Link>
                <Link href="/contrast-checker" className="py-2 px-3">Contrast</Link>
                {isAdmin && <Link href="/admin" className="py-2 px-3">Admin</Link>}
              </nav>
            </SheetContent>
          </Sheet>

        </div>
        {!isUserLoading && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 hover:border-primary/50 transition-colors p-0 overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 glass border-white/10" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold leading-none">{user.displayName || user.email?.split('@')[0] || "User"}</p>
                        {isAdmin && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase h-5">Admin</Badge>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/5" />

                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="gap-2 rounded-full px-3 md:px-6 h-10 shadow-lg shadow-primary/20">
                  <User className="w-4 h-4" />
                  <span className='hidden md:block'>Sign In</span>
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};
