-- ============================================================================
-- InciTrack — Migration 001: Create Incidents Table
-- ============================================================================
-- Jalankan script ini di Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Prerequisites:
--   1. Buat project Supabase di https://supabase.com
--   2. PostGIS biasanya sudah tersedia di Supabase (tinggal enable extension)
--
-- Penjelasan kolom:
--   - location     : Tipe GEOGRAPHY(POINT, 4326) untuk spatial queries.
--                     SRID 4326 = WGS84 (standar GPS global).
--   - latitude/lng : Kolom redundant agar bisa query tanpa parsing geography.
--   - status       : State machine sederhana (pending → on-the-way → resolved).
-- ============================================================================

-- ======================
-- 1. Enable PostGIS Extension
-- ======================
-- PostGIS menambahkan tipe data GEOGRAPHY dan fungsi spatial (ST_Distance, dll.)
-- Aman di-run berulang kali karena memakai IF NOT EXISTS.
CREATE EXTENSION IF NOT EXISTS postgis;

-- ======================
-- 2. Create ENUM Types
-- ======================
-- Menggunakan PostgreSQL ENUM untuk membatasi nilai yang valid pada level database.
-- Ini lebih aman dibanding check constraint karena tipe-nya reusable.

-- Kategori insiden di jalan tol
DO $$ BEGIN
  CREATE TYPE incident_category AS ENUM (
    'accident',    -- Kecelakaan lalu lintas
    'breakdown',   -- Kendaraan mogok
    'debris',      -- Puing / benda asing di jalan
    'weather',     -- Gangguan cuaca (banjir, kabut tebal, dll.)
    'other'        -- Kategori lainnya
  );
EXCEPTION
  -- Jika ENUM sudah ada, skip tanpa error
  WHEN duplicate_object THEN NULL;
END $$;

-- Status penanganan insiden
DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM (
    'pending',      -- Baru dilaporkan, belum ditangani
    'on-the-way',   -- Petugas sedang menuju lokasi
    'resolved'      -- Insiden selesai ditangani
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ======================
-- 3. Create Incidents Table
-- ======================
CREATE TABLE IF NOT EXISTS public.incidents (
  -- Primary key: UUID auto-generated untuk keamanan (tidak bisa di-guessing)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Informasi insiden
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category incident_category NOT NULL DEFAULT 'other',

  -- Lokasi insiden (dual storage strategy)
  -- `location` untuk spatial queries (ST_Distance, nearest neighbor, dll.)
  -- `latitude` & `longitude` untuk quick read tanpa parsing geography
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,

  -- Status penanganan
  status incident_status NOT NULL DEFAULT 'pending',

  -- Bukti foto (URL ke Supabase Storage atau external URL)
  image_url TEXT,

  -- Data pelapor
  reporter_name VARCHAR(100) NOT NULL,
  reporter_phone VARCHAR(20) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================
-- 4. Create Indexes
-- ======================

-- GIST Index: Kunci performa untuk spatial query (nearest neighbor search).
-- Tanpa index ini, setiap query harus scan seluruh tabel — sangat lambat.
CREATE INDEX IF NOT EXISTS idx_incidents_location_gist
  ON public.incidents USING GIST (location);

-- B-Tree Index: Mempercepat filtering berdasarkan status
-- (karena dashboard akan sering filter: "tampilkan semua insiden pending")
CREATE INDEX IF NOT EXISTS idx_incidents_status
  ON public.incidents (status);

-- B-Tree Index: Mempercepat sorting berdasarkan waktu
CREATE INDEX IF NOT EXISTS idx_incidents_created_at
  ON public.incidents (created_at DESC);

-- ======================
-- 5. Auto-update `updated_at` Trigger
-- ======================
-- Trigger ini otomatis mengubah `updated_at` setiap kali row di-UPDATE.
-- Penting untuk tracking kapan terakhir status berubah.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger dulu jika sudah ada, lalu buat ulang
DROP TRIGGER IF EXISTS trigger_incidents_updated_at ON public.incidents;
CREATE TRIGGER trigger_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- 6. Row Level Security (RLS)
-- ======================
-- RLS memastikan akses data dikontrol di level database,
-- bukan hanya di level aplikasi. Defense in depth.

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Siapa saja bisa membuat laporan insiden (INSERT)
-- Ini karena pelaporan bersifat publik — tidak perlu login.
CREATE POLICY "Anyone can report incidents"
  ON public.incidents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Siapa saja bisa melihat semua insiden (SELECT)
-- Data insiden bersifat publik untuk transparansi.
CREATE POLICY "Anyone can view incidents"
  ON public.incidents
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Hanya authenticated users yang bisa update (misal: petugas ubah status)
CREATE POLICY "Authenticated users can update incidents"
  ON public.incidents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ======================
-- 7. Helper: Insert Incident with Auto-Geography
-- ======================
-- RPC Function ini memudahkan insert dari client-side.
-- Client hanya perlu kirim lat/lng, function ini otomatis buat GEOGRAPHY point.

CREATE OR REPLACE FUNCTION insert_incident(
  p_title VARCHAR,
  p_description TEXT,
  p_category incident_category,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_reporter_name VARCHAR,
  p_reporter_phone VARCHAR,
  p_image_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER  -- Berjalan dengan privilege pemilik function, bukan caller
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.incidents (
    title, description, category,
    location, latitude, longitude,
    reporter_name, reporter_phone, image_url
  ) VALUES (
    p_title, p_description, p_category,
    -- ST_MakePoint(longitude, latitude) — perhatikan: longitude PERTAMA (X), latitude KEDUA (Y).
    -- Ini adalah konvensi PostGIS yang sering membingungkan.
    -- ::geography mengkonversi ke tipe GEOGRAPHY agar ST_Distance menghitung jarak dalam meter.
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    p_latitude, p_longitude,
    p_reporter_name, p_reporter_phone, p_image_url
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- ======================
-- SELESAI! ✅
-- ======================
-- Setelah menjalankan script ini, kamu bisa verifikasi:
--   SELECT * FROM public.incidents;  -- Harusnya kosong tapi tabel exist
--   SELECT PostGIS_Version();        -- Harusnya menampilkan versi PostGIS
