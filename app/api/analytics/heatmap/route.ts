/**
 * InciTrack — GET /api/analytics/heatmap
 * 
 * Mengambil data koordinat seluruh insiden untuk divisualisasikan 
 * ke dalam Heatmap Layer di Dashboard.
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Kita hanya butuh lat, lng, dan category untuk heatmap & statistik
    const { data, error } = await supabase
      .from('incidents')
      .select('latitude, longitude, category, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
