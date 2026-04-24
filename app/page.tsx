/**
 * InciTrack — Landing Page
 *
 * Halaman utama dengan desain Netflix-inspired.
 * Menampilkan hero section, status cards, dan CTA ke halaman report.
 */

import Link from 'next/link';

/** Data untuk status indicator cards */
const STATUS_CARDS = [
  {
    label: 'Pending',
    description: 'Menunggu respons',
    icon: '🔴',
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/20',
  },
  {
    label: 'On The Way',
    description: 'Petugas menuju lokasi',
    icon: '🟡',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  {
    label: 'Resolved',
    description: 'Insiden selesai',
    icon: '🟢',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
] as const;

/** Feature highlight data */
const FEATURES = [
  {
    title: 'GPS Auto-Detection',
    description: 'Lokasi insiden terdeteksi otomatis menggunakan GPS device Anda.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  {
    title: 'Real-time Tracking',
    description: 'Pantau status penanganan insiden secara real-time dari mana saja.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    title: 'Nearest Officer',
    description: 'Sistem otomatis mencari petugas terdekat menggunakan spatial query.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* ============================================================
       * Hero Section
       * Gradient backdrop dengan red glow, Netflix-style
       * ============================================================ */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Background gradient glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(229, 9, 20, 0.3) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">
              Real-time Monitoring Active
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight animate-fade-in-up delay-100">
            Toll Incident
            <br />
            <span className="text-primary">Management System</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Laporkan insiden di jalan tol secara real-time. Respons cepat dari
            petugas terdekat untuk keselamatan semua pengguna jalan.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/report"
              className="w-full sm:w-auto rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-primary-hover hover:shadow-[0_0_40px_rgba(229,9,20,0.4)] active:scale-[0.98]"
            >
              Laporkan Insiden Sekarang
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto rounded-xl border border-border px-8 py-4 text-base font-semibold text-text-secondary transition-all duration-200 hover:border-border-light hover:text-text-primary hover:bg-surface"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
       * Status Cards Section
       * Menampilkan 3 tahapan status insiden
       * ============================================================ */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-text-primary mb-10">
            Alur Penanganan Insiden
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATUS_CARDS.map((card, index) => (
              <div
                key={card.label}
                className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className={`text-lg font-bold ${card.color}`}>
                  {card.label}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  {card.description}
                </p>

                {/* Connector arrow (only between cards on desktop) */}
                {index < STATUS_CARDS.length - 1 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
       * Features Section
       * ============================================================ */}
      <section id="features" className="py-16 px-4 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-text-primary mb-4">
            Mengapa InciTrack?
          </h2>
          <p className="text-center text-text-secondary mb-12 max-w-lg mx-auto">
            Dibangun dengan teknologi modern untuk respons insiden yang lebih cepat dan efisien.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:border-primary/30 hover:bg-surface-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 transition-colors group-hover:bg-primary/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
       * Footer
       * ============================================================ */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-sm font-semibold text-text-primary">InciTrack</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} InciTrack — Real-time Toll Incident Management System
          </p>
        </div>
      </footer>
    </main>
  );
}
