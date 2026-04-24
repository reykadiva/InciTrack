-- ============================================================================
-- InciTrack — Migration 004: Auth Profiles & Roles
-- ============================================================================
-- Menyiapkan tabel `profiles` yang terhubung dengan `auth.users` Supabase.
-- Dilengkapi dengan Enum `user_role` untuk akses Control Center.
-- ============================================================================

-- 1. Buat Enum untuk Role
CREATE TYPE user_role AS ENUM ('admin', 'officer');

-- 2. Buat tabel Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'officer',
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Aktifkan RLS pada Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy Profile: Siapapun (Admin/Petugas) bisa membaca profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Policy Profile: Hanya bisa update profile sendiri (optional, untuk masa depan)
CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 4. TRIGGER: Otomatis buat profile saat user baru daftar di Auth Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Default jadikan semua user baru sebagai 'admin' (Untuk MVP Portfolio)
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger ke tabel auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 5. [OPSIONAL TAPI KRUSIAL] Amankan Operasi UPDATE Tabel Incidents
-- Drop policy sebelumnya yang mungkin memperbolehkan Anon update (jika ada)
DROP POLICY IF EXISTS "Enable ALL for authenticated users only" ON public.incidents;
DROP POLICY IF EXISTS "Anon Uploads allowed" ON public.incidents;

-- Policy Incidents Update: Hanya Admin/Officer yang bisa merubah status laporan!
CREATE POLICY "Hanya Admin & Officer yang bisa UPDATE Incidents"
ON public.incidents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'officer')
  )
);
