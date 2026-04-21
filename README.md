Main Link Demo(vercel): 

# InciTrack — Real-time Toll Incident Management

**InciTrack** adalah platform manajemen insiden jalan tol modern yang dirancang untuk memangkas waktu respon darurat. Menggunakan teknologi *geospatial* presisi, InciTrack memungkinkan pelaporan instan dari pengguna jalan dan pemantauan real-time bagi petugas pusat kendali.

---

## Key Features

- **One-Thumb Mobile UX:** Interface pelaporan yang dioptimalkan untuk penggunaan satu tangan dalam kondisi darurat.
- **Auto-GPS Precision:** Secara otomatis menangkap koordinat lokasi kejadian menggunakan API Geolocation.
- **Native Camera Integration:** Unggah foto barang bukti langsung dari kamera ponsel via `capture="environment"`.
- **Real-time Control Center:** Dashboard admin yang diperbarui secara instan menggunakan Supabase Realtime (WebSockets).
- **Smart Dispatcher (PostGIS):** Algoritma pencarian petugas patroli terdekat menggunakan query spasial `ST_Distance`.

## Tech Stack

- Framework: [Next.js 16](https://nextjs.org/) (App Router)
- Language: TypeScript
- Styling: [Tailwind CSS v4](https://tailwindcss.com/) (Netflix Dark Theme)
- Database: PostgreSQL with **PostGIS** extension
- Backend/Infrastructure: [Supabase](https://supabase.com/) (Auth, Storage, Real-time)
- Icons: Lucide React

## Project Progress

### Sprint 1 & 2 (Current Status)
- [x] Database Schema with PostGIS extension.
- [x] Incident reporting API with Zod validation.
- [x] Mobile-friendly Report Form with GPS & Image Upload.
- [x] Real-time Admin Dashboard for incident monitoring.

### Sprint 3 (Planned)
- [ ] Role-Based Authentication (Admin & Staff).
- [ ] Incident Heatmaps (identifying blackspots).
- [ ] Push Notifications for field officers.

---

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/reykadiva/InciTrack.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
