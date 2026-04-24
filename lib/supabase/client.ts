/**
 * InciTrack — Supabase Browser Client (Singleton)
 *
 * Client ini digunakan di komponen React (client-side / "use client").
 * Menggunakan `anon` key yang dibatasi oleh Row Level Security (RLS).
 *
 * Pattern: Singleton
 *   Kita hanya perlu SATU instance Supabase client di browser.
 *   Memanggil createBrowserSupabaseClient() berulang kali
 *   akan mengembalikan instance yang sama.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance — disimpan di module scope
let client: SupabaseClient | null = null;

/**
 * Mendapatkan Supabase client untuk browser.
 * Menggunakan NEXT_PUBLIC_ env vars yang di-inline saat build.
 *
 * @throws Error jika environment variables belum diset
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  // Return existing instance jika sudah ada (singleton pattern)
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail fast: Lebih baik error jelas di development
  // daripada debugging request yang gagal tanpa pesan
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables.\n' +
      'Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
      'sudah diset di file .env.local.\n' +
      'Lihat .env.local.example untuk contoh.'
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
