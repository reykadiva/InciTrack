/**
 * InciTrack — POST /api/upload
 *
 * API Endpoint ini menangani unggah file foto kejadian (Image Attachment)
 * secara aman ke Supabase Storage. Endpoint merespons dengan URL publik.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // 1. Ambil body berformat form-data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan di payload.' },
        { status: 400 }
      );
    }

    // 2. Validasi tipe (MimeType gambar) & ukuran max 5MB
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Hanya tipe file gambar yang diizinkan.' },
        { status: 400 }
      );
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5 Megabytes
      return NextResponse.json(
        { success: false, error: 'Ukuran file foto maksimal 5 MB.' },
        { status: 400 }
      );
    }

    // 3. Konversi file jadi Buffer untuk upload ke Storage Backend Node/V8
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Bikin ekstensi nama secara dinamis
    const extension = file.name.split('.').pop();
    const fileName = `incident_${uuidv4()}.${extension}`;

    // 4. Inisiasi Storage
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from('incident-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600', // Caching 1 Jam pada edge
        upsert: false // Tolak tindih nama (sudah aman berkat UUIDv4)
      });

    if (error) {
      console.error('[API /upload] Supabase upload failed:', error.message);
      return NextResponse.json(
        { success: false, error: 'Gagal mengunggah foto laporan.' },
        { status: 500 }
      );
    }

    // 5. Berhasil diupload, saatnya mendapatkan URL Publiknya (Karena bucketnya public true)
    const { data: publicUrlData } = supabase.storage
      .from('incident-images')
      .getPublicUrl(data.path);

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          url: publicUrlData.publicUrl 
        } 
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API /upload] Servere Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
