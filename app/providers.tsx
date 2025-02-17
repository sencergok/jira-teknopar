'use client';

import { AuthProvider } from '@/lib/hooks/use-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 