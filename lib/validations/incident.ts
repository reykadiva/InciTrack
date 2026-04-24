/**
 * InciTrack — Zod Validation Schema for Incident Reports
 *
 * Zod menangani validasi data di DUA tempat:
 *   1. Server-side (API route) — source of truth, tidak bisa di-bypass
 *   2. Client-side (form) — untuk UX yang responsif (opsional)
 *
 * Best Practice:
 *   Definisikan schema SEKALI, lalu infer TypeScript type dari schema.
 *   Ini menjamin type dan validasi selalu sinkron.
 */

import { z } from 'zod';

// ============================================================
// Incident Report Schema
// ============================================================

export const incidentReportSchema = z.object({
  /**
   * Judul insiden — singkat dan deskriptif.
   * Contoh: "Kecelakaan 2 Mobil KM 34", "Kendaraan Mogok Jalur Kiri"
   */
  title: z
    .string()
    .min(3, 'Judul minimal 3 karakter')
    .max(255, 'Judul maksimal 255 karakter')
    .trim(),

  /**
   * Deskripsi detail insiden.
   * Semakin detail, semakin mudah petugas mempersiapkan penanganan.
   */
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter (berikan detail yang cukup)')
    .max(2000, 'Deskripsi maksimal 2000 karakter')
    .trim(),

  /**
   * Kategori insiden — harus salah satu dari enum yang didefinisikan.
   * Ini match dengan PostgreSQL ENUM `incident_category`.
   */
  category: z.enum(['accident', 'breakdown', 'debris', 'weather', 'other'], {
    message: 'Pilih kategori yang valid',
  }),

  /**
   * Latitude — rentang valid: -90 (Kutub Selatan) sampai 90 (Kutub Utara).
   * Indonesia berada di sekitar -11 sampai 6.
   */
  latitude: z
    .number()
    .min(-90, 'Latitude harus antara -90 dan 90')
    .max(90, 'Latitude harus antara -90 dan 90'),

  /**
   * Longitude — rentang valid: -180 sampai 180.
   * Indonesia berada di sekitar 95 sampai 141.
   */
  longitude: z
    .number()
    .min(-180, 'Longitude harus antara -180 dan 180')
    .max(180, 'Longitude harus antara -180 dan 180'),

  /**
   * Nama pelapor — untuk follow-up dan verifikasi.
   */
  reporter_name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .trim(),

  /**
   * Nomor telepon pelapor — format Indonesia.
   * Menerima: 081234567890, +6281234567890, 08-1234-5678-90
   *
   * Regex breakdown:
   *   ^(\+62|62|0)  — Diawali +62, 62, atau 0
   *   [0-9\-\s]{8,15}$ — 8-15 digit (boleh ada dash/space)
   */
  reporter_phone: z
    .string()
    .regex(
      /^(\+62|62|0)[0-9\-\s]{8,15}$/,
      'Masukkan nomor telepon Indonesia yang valid (contoh: 081234567890)'
    ),

  /**
   * URL foto insiden — opsional.
   * Jika diisi, harus berupa URL yang valid.
   */
  image_url: z
    .string()
    .url('Masukkan URL gambar yang valid')
    .optional()
    .or(z.literal('')),  // Mengizinkan string kosong (form mengirim '' jika kosong)
});

// ============================================================
// Inferred Types dari Schema
// ============================================================

/**
 * Type yang di-infer dari Zod schema.
 * Gunakan type ini di komponen form untuk type safety.
 *
 * Equivalent dengan:
 * {
 *   title: string;
 *   description: string;
 *   category: 'accident' | 'breakdown' | 'debris' | 'weather' | 'other';
 *   latitude: number;
 *   longitude: number;
 *   reporter_name: string;
 *   reporter_phone: string;
 *   image_url?: string;
 * }
 */
export type IncidentReportInput = z.infer<typeof incidentReportSchema>;

// ============================================================
// Helper: Format Zod Errors ke Field Map
// ============================================================

/**
 * Mengkonversi ZodError menjadi map { fieldName: [error messages] }.
 * Berguna untuk menampilkan error per-field di form UI.
 *
 * @example
 * const result = incidentReportSchema.safeParse(data);
 * if (!result.success) {
 *   const errors = formatZodErrors(result.error);
 *   // errors = { title: ["Judul minimal 3 karakter"], ... }
 * }
 */
export function formatZodErrors(
  error: z.ZodError
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    // Path bisa nested (misal: ['address', 'street']),
    // kita join jadi 'address.street' untuk flat map
    const field = issue.path.join('.');
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(issue.message);
  }

  return fieldErrors;
}
