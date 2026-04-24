'use client';

/**
 * InciTrack — Navigation Bar
 *
 * Navbar responsif dengan glassmorphism effect.
 * Mobile: hamburger menu dengan slide-down animation.
 * Desktop: horizontal nav links.
 * 
 * Update Sprint 3: 
 * Mendukung Auth Session. Jika ada sesi, munculkan profil & tombol logout.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { LogOut, UserCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/report', label: 'Laporkan Insiden' },
] as const;

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    // 1. Dapatkan sesi aktif saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Dengarkan perubahan status otentikasi (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ---- Logo ---- */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Red dot indicator — simbol "live tracking" */}
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="text-xl font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors duration-200">
              InciTrack
            </span>
          </Link>

          {/* ---- Desktop Nav Links ---- */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Jika User Login, Munculkan tombol Dashboard & Logout */}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    pathname === '/dashboard'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-white hover:bg-surface-hover'
                  }`}
                >
                  Dashboard
                </Link>

                <div className="w-px h-6 bg-border mx-2" />
                
                <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-surface border border-border rounded-full">
                  <UserCircle size={20} className="text-primary" />
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">
                    {user.user_metadata?.full_name || 'Admin'}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="ml-2 text-text-muted hover:text-danger transition-colors p-1"
                    title="Keluar"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ---- Mobile Hamburger Button ---- */}
          <div className="md:hidden flex items-center gap-4">
             {/* Simple User icon for mobile if logged in */}
             {user && (
                <button onClick={handleLogout} className="text-text-muted hover:text-danger">
                  <LogOut size={20} />
                </button>
             )}
             
            <button
              type="button"
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ---- Mobile Menu (slide down) ---- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-64 opacity-100 border-b border-border' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-1 bg-background/95 backdrop-blur-md pt-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/dashboard'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-white hover:bg-surface-hover'
              }`}
            >
              Control Center
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
