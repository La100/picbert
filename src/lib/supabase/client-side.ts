import { createBrowserClient } from '@supabase/ssr'

// This is a client-safe version that can be used in client components
export function createClientSafe() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 