'use client';

/**
 * InciTrack — Control Center Dashboard (Sprint 2)
 *
 * Dashboard khusus Admin/Petugas Jalan Tol.
 * Memonitor insiden secara Real-Time menggunakan WebSockets (Supabase Channels).
 * Integrasi PostGIS Spatial Query untuk fitur penugasan "Dispatch Terdekat".
 */

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { Incident, NearestOfficer, IncidentCategory, IncidentStatus } from '@/lib/types/database';
import { BadgeAlert, Search, RefreshCw, CarFront, Umbrella, ShieldAlert, Wrench, PackageOpen, HelpCircle, Siren, MapPin, Map, PhoneCall, Image as ImageIcon, User } from 'lucide-react';

const CATEGORY_MAP: Record<IncidentCategory, { label: string; icon: React.ReactNode; color: string }> = {
  accident: { label: 'Kecelakaan', icon: <CarFront size={18} />, color: 'text-danger' },
  breakdown: { label: 'Mogok', icon: <Wrench size={18} />, color: 'text-warning' },
  debris: { label: 'Puing Jalan', icon: <PackageOpen size={18} />, color: 'text-warning' },
  weather: { label: 'Cuaca/Banjir', icon: <Umbrella size={18} />, color: 'text-[#3B82F6]' },
  other: { label: 'Lainnya', icon: <HelpCircle size={18} />, color: 'text-text-secondary' },
};

const STATUS_MAP: Record<IncidentStatus, { label: string; style: string }> = {
  pending: { label: 'SOS PENDING', style: 'bg-danger text-white border-danger' },
  'on-the-way': { label: 'ON THE WAY', style: 'bg-warning/20 text-warning border-warning/50' },
  resolved: { label: 'RESOLVED', style: 'bg-success/20 text-success border-success/50' },
};

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States of Modal Rescue (Nearest Officers Dispatching)
  const [selectedIncidentPos, setSelectedIncidentPos] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyOfficers, setNearbyOfficers] = useState<NearestOfficer[]>([]);
  const [isSearchingOfficers, setIsSearchingOfficers] = useState(false);

  // Instansiasi dari Browser Singleton Client untuk auth socket aman
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    fetchIncidents();

    // ==========================================
    // Realtime Postgres Change Listener
    // ==========================================
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          // Ketika ada row INSERT insiden baru dari peramban pelapor:
          const newIncident = payload.new as Incident;
          // Unshift: masukan ke top array list secara animasi tanpa refresh!
          setIncidents((prev) => [newIncident, ...prev]);
          alert("🚨 PANGGILAN DARURAT BARU MASUK!");
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        (payload) => {
          // Ketika Officer di jalan mem-update state ke "on-the-way" 
          const updatedIncident = payload.new as Incident;
          setIncidents((prev) =>
            prev.map((inc) => (inc.id === updatedIncident.id ? updatedIncident : inc))
          );
        }
      )
      .subscribe();

    return () => {
      // Clean up websocket / unmount component
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncidents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (!error && data) {
      setIncidents(data);
    }
    setIsLoading(false);
  };

  // ==========================================
  // Trigger RPC PostGIS untuk Dispatch
  // ==========================================
  const findNearestOfficers = async (lat: number, lng: number) => {
    setSelectedIncidentPos({ lat, lng });
    setIsSearchingOfficers(true);
    setNearbyOfficers([]);

    const { data, error } = await supabase.rpc('get_nearest_officers', {
      p_latitude: lat,
      p_longitude: lng,
      p_radius_meters: 25000, // Cari dalam radius 25 KM
      p_limit: 3 // Ambil Top 3 Terdekat
    });

    if (!error && data) {
      setNearbyOfficers(data as NearestOfficer[]);
    }
    setIsSearchingOfficers(false);
  };

  const closeModal = () => setSelectedIncidentPos(null);

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Tab */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-surface border border-border p-5 rounded-2xl mb-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-danger/20 p-3 rounded-full animate-pulse-glow">
              <ShieldAlert className="text-danger w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">Control Center</h1>
              <p className="text-text-muted text-sm font-medium">Monitoring Command Room Real-Time <span className="text-success ml-1 inline-flex items-center gap-1">• Live connected</span></p>
            </div>
          </div>
          <button onClick={fetchIncidents} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-surface-hover hover:bg-border rounded-xl text-text-primary transition-colors">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh Stream
          </button>
        </div>

        {/* Dashboard Cards Content */}
        {isLoading && incidents.length === 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
             <div className="h-64 bg-surface/50 border border-border rounded-2xl animate-shimmer" />
             <div className="h-64 bg-surface/50 border border-border rounded-2xl animate-shimmer delay-100" />
             <div className="h-64 bg-surface/50 border border-border rounded-2xl animate-shimmer delay-200" />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {incidents.map((incident) => {
               const catData = CATEGORY_MAP[incident.category];
               const statusData = STATUS_MAP[incident.status];

               return (
                <div key={incident.id} className="group flex flex-col bg-surface border border-border hover:border-border-light rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl animate-fade-in-up">
                  
                  {/* Photo Head Cover (If any) */}
                  {incident.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div className="w-full h-40 bg-black overflow-hidden relative">
                       <img src={incident.image_url} alt="BarBuk" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2">
                         {catData.icon} {catData.label}
                       </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-surface-light border-b border-border flex flex-col items-center justify-center relative">
                       <ImageIcon size={32} className="text-text-muted opacity-30" />
                       <div className="absolute top-3 left-3 bg-surface border border-border px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                         {catData.icon} <span className={catData.color}>{catData.label}</span>
                       </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white leading-tight truncate-multiline">{incident.title}</h3>
                    </div>
                    <p className="text-sm text-text-muted mb-4 line-clamp-2">{incident.description}</p>
                    
                    <div className="mt-auto space-y-3">
                      {/* Label Kontak & Posisi */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary bg-background p-3 rounded-xl border border-border">
                        <div className="flex items-center gap-1.5 line-clamp-1"><User size={14} className="text-primary" /> {incident.reporter_name}</div>
                        <div className="flex items-center gap-1.5"><PhoneCall size={14} className="text-success" /> {incident.reporter_phone}</div>
                        <div className="col-span-2 flex items-center gap-1.5"><MapPin size={14} className="text-warning" /> {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</div>
                      </div>

                      {/* Status & Action Buttons */}
                      <div className="flex gap-2 items-center justify-between pt-2">
                        <span className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wider ${statusData.style}`}>
                          {statusData.label}
                        </span>
                        
                        {/* Tombol Aksi - Aktifkan RPC Spatial Mapping */}
                        {incident.status === 'pending' && (
                           <button onClick={() => findNearestOfficers(incident.latitude, incident.longitude)} className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-transform shadow-lg active:scale-95">
                             <Siren size={14} /> Dispatch Patroli
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
               );
            })}
            
            {incidents.length === 0 && (
               <div className="col-span-full py-20 text-center">
                 <BadgeAlert className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
                 <h2 className="text-xl font-bold text-text-secondary mb-2">Aman Terkendali</h2>
                 <p className="text-text-muted">Tidak ada SOS atau laporan insiden saat ini.</p>
               </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL DISPATCH TERDEKAT (PostGIS UI) */}
      {/* ========================================================= */}
      {selectedIncidentPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="bg-surface-light border-b border-border p-5 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="bg-primary/20 p-2 rounded-full"><Map className="text-primary" /></div>
                 <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Radar Petugas Terdekat</h2>
                    <p className="text-text-muted text-xs">Jangkauan Radius K-Nearest Neighbor (PostGIS)</p>
                 </div>
               </div>
               <button onClick={closeModal} className="text-text-muted hover:text-white p-2 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {isSearchingOfficers ? (
                 <div className="py-10 text-center flex flex-col items-center">
                   <Search className="w-10 h-10 text-primary animate-pulse-glow mb-4" />
                   <p className="text-text-primary mb-2 font-medium">Memindai Armada Navigasi...</p>
                   <p className="text-xs text-text-muted font-mono">EXECUTE rpc('get_nearest_officers')</p>
                 </div>
              ) : nearbyOfficers.length > 0 ? (
                 <div className="space-y-4">
                   <p className="text-sm text-text-secondary mb-2">Ditemukan {nearbyOfficers.length} petugas di area sekitar. (Status: Siaga)</p>
                   {nearbyOfficers.map((officer, k) => (
                     <div key={officer.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                        <div className="flex gap-4 items-center">
                          <div className={`flex w-8 h-8 items-center justify-center rounded-full text-sm font-bold ${k === 0 ? 'bg-primary text-white shadow-lg' : 'bg-surface-light text-text-secondary'}`}>
                            #{k + 1}
                          </div>
                          <div>
                            <p className="text-white font-bold">{officer.name}</p>
                            <p className="text-xs text-text-muted flex items-center gap-1 mt-1"><CarFront size={12}/> Patroli {officer.badge_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-warning">{(officer.distance_meters / 1000).toFixed(1)} <span className="text-xs font-medium opacity-60">KM</span></div>
                          <button className="text-xs font-bold text-primary hover:underline uppercase mt-1 flex justify-end gap-1"><PhoneCall size={12}/> Tugaskan</button>
                        </div>
                     </div>
                   ))}
                 </div>
              ) : (
                 <div className="py-10 text-center">
                   <ShieldAlert className="w-12 h-12 text-warning mx-auto mb-3 opacity-80" />
                   <p className="text-white font-bold mb-1">Gagal Menemukan Patroli</p>
                   <p className="text-xs text-text-muted px-6">Tidak ada unit patroli bersatus 'available' dalam radius operasional insiden ini.</p>
                 </div>
              )}
            </div>
            
          </div>
        </div>
      )}

    </main>
  );
}
