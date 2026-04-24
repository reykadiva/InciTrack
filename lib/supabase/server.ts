/**
 * InciTrack — Supabase Server Client
 *
 * Client ini HANYA digunakan di server-side code:
 *   - API Routes (contoh: app/api/report/route.ts)
 *   - Server Components
 *   - Server Actions
 *
 * Diperbarui ke pola @supabase/ssr untuk dukungan cookie/session middleware!
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client standar menggunakan ANON KEY. Membawa informasi session cookie 
 * milik pengguna secara default, sehingga RLS Supabase berlaku.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Error diabaikan karena saat dipanggil di Server Component, Next.js tidak bisa set cookie
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Sama dengan catch atas
          }
        },
      },
    }
  );
}

/**
 * Client KHUSUS menggunakan SERVICE ROLE KEY.
 * - Digunakan untuk Bypass RLS (seperti menyimpan URL storage, cron job, dll).
 * - JANGAN pernah gunakan ini jika berurusan dengan otorisasi user biasa!
 */
export async function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}
