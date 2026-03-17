"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { 
  Users, 
  ShieldAlert, 
  Loader2, 
  Search, 
  Calendar, 
  Mail, 
  Crown,
  ShieldCheck,
  Download,
  Heart,
  RefreshCcw,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SUPER_ADMIN_EMAIL = 'nooriservices01@gmail.com';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const emailMatch = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const roleMatch = profile?.role === 'admin';
    return emailMatch || roleMatch;
  }, [user, profile]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isSuperAdmin) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db, isSuperAdmin]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const palettesQuery = useMemoFirebase(() => {
    if (!db || !isSuperAdmin) return null;
    return query(collection(db, 'public_palettes'));
  }, [db, isSuperAdmin]);
  const { data: publicPalettes, isLoading: isPalettesLoading } = useCollection(palettesQuery);

  const totalLikes = useMemo(() => {
    if (!publicPalettes) return 0;
    return publicPalettes.reduce((acc: number, curr: any) => acc + (Number(curr.likeCount) || 0), 0);
  }, [publicPalettes]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) => 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleExportCSV = () => {
    if (!users || users.length === 0) return;

    const headers = ["ID", "Username", "Email", "Role", "Created At"];
    const rows = users.map((u: any) => [
      u.id,
      u.username,
      u.email,
      u.role,
      u.createdAt instanceof Timestamp ? u.createdAt.toDate().toISOString() : "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `palette_wave_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Registry for ${users.length} users exported to CSV.`,
    });
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Verifying administrative access...</p>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          This dashboard is reserved for authorized administrators.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/')} variant="outline" className="rounded-full px-8">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Super Admin Portal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2 flex items-center gap-3">
            System Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor real-time engagement across Palette Wave.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={handleExportCSV} 
            variant="outline" 
            className="rounded-2xl gap-2 h-14 px-6 border-white/10 hover:bg-white/5"
            disabled={!users || users.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Users
          </Button>
          
          <Card className="glass border-white/10 min-w-[140px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {isUsersLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Users</p>
                <p className="text-xl font-black">{users?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 min-w-[140px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                {isPalettesLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Public Palettes</p>
                <p className="text-xl font-black">{publicPalettes?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 min-w-[140px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Global Likes</p>
                <p className="text-xl font-black">{totalLikes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <Card className="glass border-white/10 overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <CardTitle className="text-xl font-bold">User Registry</CardTitle>
            <CardDescription>Accounts registered in the system.</CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 rounded-full h-11" 
              placeholder="Search registry..." 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isUsersLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Fetching registry data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent bg-white/2">
                  <TableHead className="w-[300px]">User Profile</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Unique ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u: any) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-white/5">
                            <AvatarImage src={u.photoURL} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              {u.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold group-hover:text-primary transition-colors">{u.username}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {u.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(u.role === 'admin' || u.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) ? (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 px-3 py-1">
                            <Crown className="w-3 h-3" /> Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/10 px-3 py-1">
                            Standard User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-50" /> 
                          {u.createdAt instanceof Timestamp 
                            ? u.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-[10px] opacity-30 select-all">
                          {u.id}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        Authorized Access Only • Palette Wave Control Center
      </footer>
    </div>
  );
}
