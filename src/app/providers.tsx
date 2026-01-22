'use client';

import { ClerkProvider } from '@clerk/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  // During build without env vars, render children without Clerk
  // This allows the build to pass; Clerk will work at runtime with proper env vars
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  
  return <ClerkProvider>{children}</ClerkProvider>;
}
