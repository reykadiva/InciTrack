-- ============================================================================
-- InciTrack — Seed Data (Sprint 4: Heatmap Simulation)
-- ============================================================================
-- Script ini menghasilkan 50+ data insiden dummy yang mengelompok (clustered)
-- di area spesifik Tol Cipularang, Jagorawi, dan Jakarta-Cikampek.
-- ============================================================================

-- Bersihkan data lama agar bersih (Opsional - Hapus jika ingin merge data asli)
-- DELETE FROM public.incidents;

-- 1. CLUSTER: TOL CIPULARANG (KM 90 - 100) — Rawan Laka & Cuaca
-- Latitude: -6.67 s/d -6.75 | Longitude: 107.41 s/d 107.45
INSERT INTO public.incidents (title, description, category, latitude, longitude, reporter_name, reporter_phone, status, created_at)
SELECT 
  'Laka Lantas KM ' || (90 + (i % 10)),
  'Tabrakan beruntun melibatkan 3 kendaraan di lajur kanan.',
  'accident',
  -6.67 + (random() * 0.08),
  107.41 + (random() * 0.04),
  'Pengguna Jalan ' || i,
  '081234567' || i,
  'pending',
  NOW() - (random() * interval '24 hours')
FROM generate_series(1, 20) AS i;

-- 2. CLUSTER: TOL JAGORAWI (KM 10 - 20) — Rawan Mogok & Ban Pecah
-- Latitude: -6.35 s/d -6.45 | Longitude: 106.85 s/d 106.89
INSERT INTO public.incidents (title, description, category, latitude, longitude, reporter_name, reporter_phone, status, created_at)
SELECT 
  'Kendaraan Mogok KM ' || (10 + (i % 10)),
  'Mobil sedan mengalami overheat di bahu jalan.',
  'breakdown',
  -6.35 + (random() * 0.1),
  106.85 + (random() * 0.04),
  'Driver Online ' || i,
  '089876543' || i,
  'pending',
  NOW() - (random() * interval '48 hours')
FROM generate_series(21, 35) AS i;

-- 3. CLUSTER: TOL JAKARTA-CIKAMPEK (KM 10 - 30) — Rawan Genangan & Puing
-- Latitude: -6.22 s/d -6.30 | Longitude: 106.95 s/d 107.15
INSERT INTO public.incidents (title, description, category, latitude, longitude, reporter_name, reporter_phone, status, created_at)
SELECT 
  'Genangan Air KM ' || (10 + (i % 20)),
  'Terdapat genangan air di lajur 1 akibat curah hujan tinggi.',
  'weather',
  -6.22 + (random() * 0.08),
  106.95 + (random() * 0.2),
  'Patroli ' || i,
  '087766554' || i,
  'pending',
  NOW() - (random() * interval '12 hours')
FROM generate_series(36, 50) AS i;

-- Tambahkan beberapa data Puing Jalan (Debris) secara acak
INSERT INTO public.incidents (title, description, category, latitude, longitude, reporter_name, reporter_phone, status, created_at)
SELECT 
  'Puing Ban Pecah',
  'Terdapat serpihan ban di tengah jalan, membahayakan pengendara.',
  'debris',
  -6.4 + (random() * 0.5),
  107.0 + (random() * 0.5),
  'Warga ' || i,
  '085544332' || i,
  'pending',
  NOW()
FROM generate_series(51, 55) AS i;
