/**
 * InciTrack — Edge Middleware (Gatekeeper)
 *
 * Melindungi rute private (seperti /dashboard) agar hanya 
 * bisa diakses oleh pengguna yang sudah memiliki session Supabase.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Periksa apakah user memiliki session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika URL mengarah ke area admin (/dashboard) dan TIDAK ada session user
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    // Tendang (Redirect) user ke halaman /login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Jika user sudah login, tapi mengakses halaman /login
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Konfigurasi agar Middleware hanya bekerja di rute spesifik (hemat resource)
export const config = {
  matcher: [
    /*
     * Mengeksekusi middleware untuk semua URL kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
