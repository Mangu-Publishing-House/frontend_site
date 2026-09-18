'use client';

import dynamic from 'next/dynamic';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';

// PERF-PHASE3-2 — AudioPlayerProvider + MiniPlayer are large (560-line engine +
// Web Audio API glue). Lazy-load them so the root bundle is not penalised on
// every page — they are only needed once the user visits an audio route.
const AudioPlayerProvider = dynamic(
  () => import('@/components/audio/AudioContext').then((m) => m.AudioPlayerProvider),
  { ssr: false }
);
const MiniPlayer = dynamic(
  () => import('@/components/audio/MiniPlayer').then((m) => m.MiniPlayer),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <AudioPlayerProvider>
          {children}
          <MiniPlayer />
        </AudioPlayerProvider>
        <ToastProvider />
      </AuthProvider>
    </ThemeProvider>
  );
}
