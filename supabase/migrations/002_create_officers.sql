-- ============================================================================
-- InciTrack — Migration 002: Create Officers Table & Nearest Search
-- ============================================================================
-- Jalankan script ini di Supabase SQL Editor SETELAH 001_create_incidents.sql
--
-- Penjelasan:
--   Tabel `officers` menyimpan data petugas tol beserta lokasi real-time mereka.
--   RPC function `get_nearest_officers` digunakan untuk mencari petugas terdekat
--   dari lokasi insiden menggunakan PostGIS spatial operator `<->`.
-- ============================================================================

-- ======================
-- 1. Create Officer Status ENUM
-- ======================
DO $$ BEGIN
  CREATE TYPE officer_status AS ENUM (
    'available',    -- Siap ditugaskan
    'on-duty',      -- Sedang menangani insiden
    'off-duty'      -- Tidak bertugas
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ======================
-- 2. Create Officers Table
-- ======================
CREATE TABLE IF NOT EXISTS public.officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Data petugas
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  badge_number VARCHAR(20) UNIQUE NOT NULL,   -- Nomor identitas petugas

  -- Lokasi real-time petugas (di-update via mobile app)
  location GEOGRAPHY(POINT, 4326),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Status ketersediaan
  status officer_status NOT NULL DEFAULT 'available',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================
-- 3. Create Indexes
-- ======================

-- GIST Index: Krusial untuk nearest-neighbor search yang cepat
CREATE INDEX IF NOT EXISTS idx_officers_location_gist
  ON public.officers USING GIST (location);

-- B-Tree Index: Filter petugas berdasarkan status
CREATE INDEX IF NOT EXISTS idx_officers_status
  ON public.officers (status);

-- ======================
-- 4. Auto-update Trigger (sama seperti incidents)
-- ======================
DROP TRIGGER IF EXISTS trigger_officers_updated_at ON public.officers;
CREATE TRIGGER trigger_officers_updated_at
  BEFORE UPDATE ON public.officers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- 5. RLS Policies
-- ======================
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

-- Semua bisa lihat data petugas (untuk menampilkan di peta)
CREATE POLICY "Anyone can view officers"
  ON public.officers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Hanya authenticated yang bisa update (petugas update lokasi via app)
CREATE POLICY "Authenticated users can update officers"
  ON public.officers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Hanya authenticated yang bisa insert (admin menambah petugas)
CREATE POLICY "Authenticated users can insert officers"
  ON public.officers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ======================
-- 6. RPC Function: Get Nearest Officers
-- ======================
-- Ini adalah query UTAMA untuk fitur dispatch — mencari petugas terdekat
-- dari lokasi insiden yang dilaporkan.
--
-- Cara kerja:
--   1. Filter hanya petugas yang statusnya 'available' (siap ditugaskan)
--   2. Hitung jarak menggunakan ST_Distance (mengembalikan meter)
--   3. Sort berdasarkan jarak terdekat menggunakan operator `<->`
--   4. Operator `<->` lebih cepat dari ORDER BY ST_Distance() karena
--      memanfaatkan GIST index secara langsung (index-assisted KNN)
--   5. Limit hasilnya dan filter berdasarkan radius

CREATE OR REPLACE FUNCTION get_nearest_officers(
  p_latitude DOUBLE PRECISION,    -- Latitude lokasi insiden
  p_longitude DOUBLE PRECISION,   -- Longitude lokasi insiden
  p_radius_meters DOUBLE PRECISION DEFAULT 50000,  -- Radius pencarian (default 50km)
  p_limit INTEGER DEFAULT 5       -- Jumlah maksimum petugas yang dikembalikan
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  phone VARCHAR,
  badge_number VARCHAR,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status officer_status,
  distance_meters DOUBLE PRECISION  -- Jarak dari lokasi insiden (dalam meter)
)
LANGUAGE sql
STABLE  -- Menandakan function ini read-only (membantu optimizer PostgreSQL)
AS $$
  SELECT
    o.id,
    o.name,
    o.phone,
    o.badge_number,
    o.latitude,
    o.longitude,
    o.status,
    -- ST_Distance menghitung jarak geodesic (memperhitungkan kelengkungan bumi)
    -- antara dua titik GEOGRAPHY. Hasilnya dalam METER.
    ST_Distance(
      o.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) AS distance_meters
  FROM public.officers o
  WHERE
    -- Filter 1: Hanya petugas yang available
    o.status = 'available'
    -- Filter 2: Hanya dalam radius tertentu (mengurangi jumlah kalkulasi)
    AND o.location IS NOT NULL
    AND ST_DWithin(
      o.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_meters
    )
  -- ORDER BY menggunakan operator <-> (KNN = K-Nearest Neighbor)
  -- Operator ini JAUH lebih cepat dari ORDER BY ST_Distance()
  -- karena langsung memanfaatkan GIST index tanpa menghitung jarak semua row.
  ORDER BY
    o.location <-> ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
  LIMIT p_limit;
$$;

-- ======================
-- 7. Seed Data: Sample Officers (Untuk Testing)
-- ======================
-- Uncomment block ini jika ingin menambah data dummy petugas.
-- Lokasi di sekitar Jakarta (Tol Jagorawi area).

/*
INSERT INTO public.officers (name, phone, badge_number, location, latitude, longitude, status) VALUES
  ('Ahmad Patroli', '081234567001', 'TOL-001',
   ST_SetSRID(ST_MakePoint(106.8456, -6.2088), 4326)::geography,
   -6.2088, 106.8456, 'available'),
  ('Budi Rescue', '081234567002', 'TOL-002',
   ST_SetSRID(ST_MakePoint(106.8556, -6.2188), 4326)::geography,
   -6.2188, 106.8556, 'available'),
  ('Citra Medic', '081234567003', 'TOL-003',
   ST_SetSRID(ST_MakePoint(106.8656, -6.2288), 4326)::geography,
   -6.2288, 106.8656, 'on-duty'),
  ('Dimas Towing', '081234567004', 'TOL-004',
   ST_SetSRID(ST_MakePoint(106.8756, -6.2388), 4326)::geography,
   -6.2388, 106.8756, 'available'),
  ('Eka Traffic', '081234567005', 'TOL-005',
   ST_SetSRID(ST_MakePoint(106.8856, -6.2488), 4326)::geography,
   -6.2488, 106.8856, 'off-duty');
*/

-- ======================
-- SELESAI! ✅
-- ======================
-- Contoh penggunaan:
--   SELECT * FROM get_nearest_officers(-6.2088, 106.8456);
--   → Mencari 5 petugas terdekat dalam radius 50km dari koordinat tersebut
--
--   SELECT * FROM get_nearest_officers(-6.2088, 106.8456, 10000, 3);
--   → Mencari 3 petugas terdekat dalam radius 10km
