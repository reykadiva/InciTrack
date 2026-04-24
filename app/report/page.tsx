/**
 * InciTrack — Report Page
 *
 * Halaman untuk melaporkan insiden baru di jalan tol.
 * Menggunakan ReportForm component yang menangani GPS dan submission.
 */

import type { Metadata } from 'next';
import ReportForm from '@/app/components/ReportForm';

export const metadata: Metadata = {
  title: 'Laporkan Insiden | InciTrack',
  description:
    'Laporkan insiden di jalan tol secara real-time. GPS otomatis mendeteksi lokasi Anda untuk respons petugas yang lebih cepat.',
};

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-12">
      {/* ---- Page Header ---- */}
      <div className="max-w-2xl mx-auto px-4 mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-text-primary">
          Laporkan Insiden
        </h1>
        <p className="mt-2 text-text-secondary">
          Laporkan kejadian di jalan tol. Koordinat GPS lokasi Anda akan
          otomatis terdeteksi untuk mempercepat respons petugas.
        </p>
      </div>

      {/* ---- Report Form ---- */}
      <ReportForm />
    </main>
  );
}
