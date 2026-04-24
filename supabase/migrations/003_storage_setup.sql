-- ============================================================================
-- InciTrack — Migration 003: Storage Bucket Setup
-- ============================================================================
-- Jalankan script ini di Supabase SQL Editor untuk menyiapkan Storage.
-- Digunakan untuk menyimpan foto-foto kejadian dari pelapor.
-- ============================================================================

-- 1. Create the Bucket
-- "public: true" berarti URL gambar bisa langsung diakses dari browser tanpa token.
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-images', 'incident-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup Row Level Security (RLS) di tabel storage.objects
-- Secara default tabel ini tertutup RLS, public bucket belum otomatis membolehkan baca.

-- A. Policy: Semua orang (anon & authenticated) boleh MELIHAT (SELECT) foto di bucket ini.
CREATE POLICY "Public Access for incident-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'incident-images');

-- B. Policy: Semua orang (anon & authenticated) boleh MENGUNGGAH (INSERT) foto.
-- CATATAN: Untuk keamanan 100%, operasi unggah sebaiknya hanya via Backend (Service Role). 
-- Tapi dalam banyak skenario MVP portofolio tanpa login, kita izinkan INSERT anon.
-- Pada sprint ini, meskipun kita punya API Endpoint pakai service_role,
-- membukanya di RLS juga dianjurkan kalau project portfolio karena lebih fleksibel.
CREATE POLICY "Anon Uploads allowed"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'incident-images');

-- SELESAI
