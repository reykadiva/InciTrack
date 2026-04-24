/**
 * InciTrack — Database Type Definitions
 *
 * Type definitions yang match 1:1 dengan schema database PostgreSQL.
 * Digunakan di seluruh aplikasi untuk type safety.
 *
 * PENTING: Jika kamu mengubah schema database (ALTER TABLE),
 * pastikan update types ini juga agar tetap sinkron.
 */

// ============================================================
// ENUM Types — Match dengan PostgreSQL ENUM
// ============================================================

/** Kategori insiden di jalan tol */
export type IncidentCategory =
  | 'accident'    // Kecelakaan lalu lintas
  | 'breakdown'   // Kendaraan mogok
  | 'debris'      // Puing / benda asing di jalan
  | 'weather'     // Gangguan cuaca
  | 'other';      // Lainnya

/** Status penanganan insiden (state machine: pending → on-the-way → resolved) */
export type IncidentStatus =
  | 'pending'     // Baru dilaporkan
  | 'on-the-way'  // Petugas menuju lokasi
  | 'resolved';   // Selesai ditangani

/** Status ketersediaan petugas */
export type OfficerStatus =
  | 'available'   // Siap ditugaskan
  | 'on-duty'     // Sedang bertugas
  | 'off-duty';   // Tidak bertugas

// ============================================================
// Table Row Types
// ============================================================

/** Representasi satu baris di tabel `incidents` */
export interface Incident {
  id: string;                    // UUID
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  image_url: string | null;
  reporter_name: string;
  reporter_phone: string;
  created_at: string;            // ISO 8601 string from Supabase
  updated_at: string;
}

/** Representasi satu baris di tabel `officers` */
export interface Officer {
  id: string;
  name: string;
  phone: string;
  badge_number: string;
  latitude: number | null;
  longitude: number | null;
  status: OfficerStatus;
  created_at: string;
  updated_at: string;
}

/** Hasil dari RPC function `get_nearest_officers` */
export interface NearestOfficer {
  id: string;
  name: string;
  phone: string;
  badge_number: string;
  latitude: number;
  longitude: number;
  status: OfficerStatus;
  distance_meters: number;       // Jarak dari lokasi insiden (meter)
}

// ============================================================
// API Payload Types — Untuk request/response
// ============================================================

/** Payload yang dikirim client untuk membuat laporan insiden baru */
export interface CreateIncidentPayload {
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  reporter_name: string;
  reporter_phone: string;
  image_url?: string;
}

/** Response sukses dari API endpoint /api/report */
export interface CreateIncidentResponse {
  success: true;
  data: {
    id: string;
    message: string;
  };
}

/** Response error dari API endpoint */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Record<string, string[]>;  // Field-level validation errors
  };
}
