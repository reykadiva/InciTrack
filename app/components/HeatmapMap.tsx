'use client';

/**
 * InciTrack — Heatmap Visualization Map
 * 
 * Menggunakan React-Leaflet untuk peta dasar dan Leaflet.heat untuk layer heatmap.
 * Menggunakan dynamic import di dashboard karena Leaflet butuh objek 'window'.
 */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Perbaikan bug icon default Leaflet di Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Sub-komponen Heatmap Layer ---
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    // @ts-ignore - leaflet.heat menambahkan method heatLayer ke L
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      // Netflix Gradient: Kuning -> Merah
      gradient: {
        0.4: '#F59E0B', // Yellow-500
        0.6: '#EA580C', // Orange-600
        0.8: '#E11D48', // Rose-600
        1.0: '#E50914'  // Netflix Red
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

interface HeatmapMapProps {
  incidents: any[];
  showHeatmap?: boolean;
}

export default function HeatmapMap({ incidents, showHeatmap = true }: HeatmapMapProps) {
  // Center of operation: Area Jabodetabek/Cipularang
  const center: [number, number] = [-6.4, 107.0];
  
  // Format data untuk Leaflet.heat: [lat, lng, intensity]
  const heatPoints: [number, number, number][] = incidents.map(inc => [
    inc.latitude,
    inc.longitude,
    1.0 // Intensitas default per titik
  ]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={9} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark Theme Map Tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Heatmap Layer */}
        {showHeatmap && <HeatLayer points={heatPoints} />}

        {/* Individual Markers (hanya muncul jika zoom cukup dalam) */}
        {incidents.map((inc, idx) => (
          <Marker key={idx} position={[inc.latitude, inc.longitude]}>
            <Popup className="custom-popup">
              <div className="p-1">
                <p className="font-bold text-gray-900">{inc.title}</p>
                <p className="text-xs text-gray-600">{inc.category}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md border border-border p-3 rounded-xl z-[1000] shadow-lg pointer-events-none">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Intensity Scale</p>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#EA580C] to-[#E50914]" />
          <span className="text-[9px] text-text-secondary font-mono">HIGH RISK</span>
        </div>
      </div>
    </div>
  );
}
