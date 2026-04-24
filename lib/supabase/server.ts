/**
 * InciTrack — Supabase Server Client
 *
 * Client ini HANYA digunakan di server-side code:
 *   - API Routes (contoh: app/api/report/route.ts)
 *   - Server Components
 *   - Server Actions
 *
 * Menggunakan `service_role` key yang BYPASS semua RLS policies.
 * Ini memberikan full admin access ke database.
 *
 * ⚠️ KEAMANAN: JANGAN pernah expose client ini ke browser.
 *    File ini tidak boleh di-import dari komponen "use client".
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Membuat Supabase client baru untuk server-side operations.
 *
 * Berbeda dengan browser client yang singleton, server client
 * dibuat per-request untuk menghindari state leaking antar request.
 * (Penting di serverless environment seperti Vercel)
 *
 * @throws Error jika environment variables belum diset
 */
export function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing server-side Supabase environment variables.\n' +
      'Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY ' +
      'sudah diset di file .env.local.\n' +
      'Lihat .env.local.example untuk contoh.'
    );
  }

  // Buat instance baru setiap call (tidak singleton)
  // karena di server setiap request harus isolated
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Nonaktifkan auto-refresh dan session persistence
      // karena ini server-side, bukan browser
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
