/**
 * InciTrack — Leaflet Type Declarations
 * 
 * Digunakan untuk mengatasi error 'Could not find a declaration file' 
 * ketika instalasi @types/leaflet gagal di environment CI/Build.
 */

declare module 'leaflet' {
  const L: any;
  export default L;
}

declare module 'react-leaflet' {
  export const MapContainer: any;
  export const TileLayer: any;
  export const Marker: any;
  export const Popup: any;
  export const useMap: any;
}

declare module 'leaflet.heat';
