/**
 * InciTrack — Supabase Client (Browser)
 * 
 * Client ini HANYA digunakan di client-side code (browser) 
 * seperti useEffect, onClick handlers, dan Client Components.
 * Dibuat menggunakan pola Singleton dari @supabase/ssr.
 */

import { createBrowserClient } from '@supabase/ssr';

export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
