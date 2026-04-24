/**
 * InciTrack — POST /api/report
 *
 * API Route Handler untuk menerima laporan insiden baru.
 *
 * Flow:
 *   1. Parse request body (JSON)
 *   2. Validasi data dengan Zod schema
 *   3. Insert ke database via Supabase RPC (insert_incident)
 *   4. Return response dengan ID insiden baru
 *
 * Error Handling:
 *   - 400: Request body tidak valid (bukan JSON, atau Zod validation gagal)
 *   - 500: Server error (database down, dll.)
 *   - 201: Berhasil membuat insiden baru
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  incidentReportSchema,
  formatZodErrors,
} from '@/lib/validations/incident';

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // Step 1: Parse Request Body
    // ============================================================
    // request.json() bisa throw jika body bukan valid JSON.
    // Kita tangkap di catch block dan return 400.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: {
            message: 'Request body harus berupa JSON yang valid.',
          },
        },
        { status: 400 }
      );
    }

    // ============================================================
    // Step 2: Validate with Zod
    // ============================================================
    // safeParse() TIDAK throw error — mengembalikan { success, data/error }.
    // Ini lebih aman dibanding parse() yang throw exception.
    const validation = incidentReportSchema.safeParse(body);

    if (!validation.success) {
      // Konversi Zod error ke format yang mudah ditampilkan di UI
      const fieldErrors = formatZodErrors(validation.error);

      return Response.json(
        {
          success: false,
          error: {
            message: 'Data yang dikirim tidak valid. Periksa kembali form Anda.',
            details: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Data sudah tervalidasi dan ter-type dengan benar
    const validData = validation.data;

    // ============================================================
    // Step 3: Insert ke Database via Supabase
    // ============================================================
    const supabase = await createServerSupabaseClient();

    // Menggunakan RPC function `insert_incident` yang sudah kita buat.
    // Function ini otomatis membuat GEOGRAPHY point dari lat/lng.
    const { data, error: dbError } = await supabase.rpc('insert_incident', {
      p_title: validData.title,
      p_description: validData.description,
      p_category: validData.category,
      p_latitude: validData.latitude,
      p_longitude: validData.longitude,
      p_reporter_name: validData.reporter_name,
      p_reporter_phone: validData.reporter_phone,
      p_image_url: validData.image_url || null,
    });

    // Handle database errors
    if (dbError) {
      console.error('[API /report] Database error:', dbError);

      return Response.json(
        {
          success: false,
          error: {
            message: 'Gagal menyimpan laporan. Silakan coba lagi.',
          },
        },
        { status: 500 }
      );
    }

    // ============================================================
    // Step 4: Return Success Response
    // ============================================================
    return Response.json(
      {
        success: true,
        data: {
          id: data, // UUID dari function insert_incident
          message: 'Laporan insiden berhasil dikirim! Petugas akan segera merespons.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // ============================================================
    // Global Error Handler — Catch unexpected errors
    // ============================================================
    console.error('[API /report] Unexpected error:', error);

    return Response.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
        },
      },
      { status: 500 }
    );
  }
}
