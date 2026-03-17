import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PaletteProvider } from '@/context/PaletteContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Palette Wave | Modern Color Palette Generator',
  description: 'Create, explore, and share beautiful color palettes for your next project.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden flex flex-col min-h-screen" suppressHydrationWarning>
        <FirebaseClientProvider>
          <PaletteProvider>
            <Navbar />
            <main className="pt-16 flex-1">
              {children}
            </main>
            <Footer />
            <Toaster />
          </PaletteProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
