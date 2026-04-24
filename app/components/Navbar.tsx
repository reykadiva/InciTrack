'use client';

/**
 * InciTrack — Navigation Bar
 *
 * Navbar responsif dengan glassmorphism effect.
 * Mobile: hamburger menu dengan slide-down animation.
 * Desktop: horizontal nav links.
 *
 * Feature:
 *   - Sticky top (tetap terlihat saat scroll)
 *   - Backdrop blur (glassmorphism)
 *   - Active link highlight
 *   - Mobile hamburger toggle
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Data navigasi — tambahkan item baru di sini */
const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/report', label: 'Laporkan Insiden' },
] as const;

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
          </div>

          {/* ---- Mobile Hamburger Button ---- */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {/* Animated hamburger → X icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ---- Mobile Menu (slide down) ---- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-1">
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
        </div>
      </div>
    </nav>
  );
}
