'use client';

/**
 * InciTrack — Control Center Dashboard (Sprint 4)
 * 
 * Update: Menambahkan Visualisasi Heatmap & Statistik Ringkas.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { Incident, IncidentCategory, IncidentStatus } from '@/lib/types/database';
import { 
  BadgeAlert, RefreshCw, CarFront, Umbrella, ShieldAlert, 
  Wrench, PackageOpen, HelpCircle, Siren, MapPin, 
  PhoneCall, Image as ImageIcon, User, BarChart3, Flame
} from 'lucide-react';

// Load Peta secara dinamis (Client-side only)
const HeatmapMap = dynamic(() => import('../components/HeatmapMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-surface-light border border-border rounded-2xl flex flex-col items-center justify-center animate-shimmer">
       <RefreshCw className="animate-spin text-primary mb-2" />
       <p className="text-sm text-text-muted">Inisialisasi Geo-Spatial Engine...</p>
    </div>
  )
});

const CATEGORY_MAP: Record<IncidentCategory, { label: string; icon: React.ReactNode; color: string }> = {
  accident: { label: 'Kecelakaan', icon: <CarFront size={18} />, color: 'text-danger' },
  breakdown: { label: 'Mogok', icon: <Wrench size={18} />, color: 'text-warning' },
  debris: { label: 'Puing Jalan', icon: <PackageOpen size={18} />, color: 'text-warning' },
  weather: { label: 'Cuaca/Banjir', icon: <Umbrella size={18} />, color: 'text-[#3B82F6]' },
  other: { label: 'Lainnya', icon: <HelpCircle size={18} />, color: 'text-text-secondary' },
};

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    fetchIncidents();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncidents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setIncidents(data);
    }
    setIsLoading(false);
  };

  // --- Statistik Logic ---
  const todayCount = incidents.filter(i => {
    const d = new Date(i.created_at);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  }).length;

  const categories = incidents.map(i => i.category);
  const topCategory = categories.sort((a, b) =>
    categories.filter(v => v === a).length - categories.filter(v => v === b).length
  ).pop();

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <ShieldAlert className="text-primary w-8 h-8" />
              CONTROL CENTER <span className="text-primary text-xl">PRO</span>
            </h1>
            <p className="text-text-muted text-sm font-medium mt-1">
              Sistem Visualisasi & Monitoring Insiden Real-Time
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
               <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
               <span className="text-xs font-bold text-success uppercase tracking-widest">Live Engine Active</span>
            </div>
            <button onClick={fetchIncidents} className="p-3 bg-surface hover:bg-surface-hover border border-border rounded-xl text-white transition-all active:scale-95">
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Stats & List (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border p-5 rounded-2xl shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                   <BarChart3 size={48} className="text-primary" />
                 </div>
                 <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Total Hari Ini</p>
                 <h2 className="text-4xl font-black text-white">{todayCount}</h2>
                 <p className="text-[10px] text-success mt-1 font-bold">+ {incidents.length} Data Historis</p>
              </div>
              <div className="bg-surface border border-border p-5 rounded-2xl shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                   <Flame size={48} className="text-warning" />
                 </div>
                 <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">KM Rawan</p>
                 <h2 className="text-2xl font-black text-white">KM 91</h2>
                 <p className="text-[10px] text-warning mt-1 font-bold">Cluster Cipularang</p>
              </div>
            </div>

            {/* Category Leaderboard */}
            <div className="bg-surface border border-border p-5 rounded-2xl shadow-xl">
               <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                 <BarChart3 size={14} className="text-primary" /> Tren Kategori Terbanyak
               </h3>
               <div className="space-y-3">
                  {Object.entries(CATEGORY_MAP).map(([key, val]) => {
                    const count = incidents.filter(i => i.category === key).length;
                    const percentage = (count / incidents.length) * 100 || 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-text-primary flex items-center gap-2">{val.icon} {val.label}</span>
                          <span className="font-bold text-white">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${key === 'accident' ? 'bg-danger' : 'bg-primary'}`} 
                             style={{ width: `${percentage}%` }}
                           />
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Incident List Scrollable */}
            <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[600px]">
              <div className="p-4 border-b border-border bg-surface-light flex justify-between items-center">
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest">Feed Laporan Terbaru</h3>
                 <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{incidents.length}</span>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {incidents.slice(0, 10).map((inc) => (
                  <div key={inc.id} className="p-4 border-b border-border hover:bg-surface-hover transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{inc.title}</h4>
                      <span className="text-[9px] text-text-muted font-mono">{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-1">{inc.description}</p>
                  </div>
                ))}
                {incidents.length === 0 && <div className="p-8 text-center text-text-muted text-xs">Menunggu data...</div>}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Map (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-surface border border-border p-2 rounded-3xl shadow-2xl h-[700px] relative">
                <HeatmapMap incidents={incidents} showHeatmap={true} />
                
                {/* Float Controls on Map */}
                <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                   <div className="bg-surface/80 backdrop-blur-md border border-border p-3 rounded-2xl shadow-2xl flex items-center gap-4">
                      <div className="bg-danger/20 p-2 rounded-lg"><Flame className="text-danger" size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Heatmap Layer</p>
                        <p className="text-xs font-bold text-white">Active (Real-time Clusters)</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </main>
  );
}
