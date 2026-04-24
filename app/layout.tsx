import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";

/**
 * Font Configuration
 * Geist — Font modern dari Vercel, cocok untuk UI dashboard.
 * Di-load sebagai CSS variable agar bisa dipakai di Tailwind v4 @theme.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * SEO Metadata — Ditampilkan di tab browser dan search engine results.
 * Menggunakan metadata API bawaan Next.js untuk optimasi SEO.
 */
export const metadata: Metadata = {
  title: {
    default: "InciTrack — Real-time Toll Incident Management",
    template: "%s | InciTrack",
  },
  description:
    "Sistem manajemen insiden jalan tol secara real-time. Laporkan insiden, lacak status, dan koordinasi petugas dengan teknologi GPS dan spatial query.",
  keywords: [
    "toll incident management",
    "jalan tol",
    "lapor insiden",
    "real-time tracking",
    "InciTrack",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Navigation bar — ditampilkan di semua halaman */}
        <Navbar />

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
