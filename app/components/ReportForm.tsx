'use client';

/**
 * InciTrack — Report Form Component (Sprint 2 - One-thumb UX)
 *
 * Komponen Laporan yang sudah ditune khusus untuk mobile experience.
 * Menggunakan kartu (Cards layout flow), padding tebal, native camera capture.
 */

import { useState, useEffect, useCallback, type FormEvent, useRef } from 'react';
import { Camera, Navigation, Send, User, ChevronRight, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import type {
  CreateIncidentResponse,
  ApiErrorResponse,
  IncidentCategory,
} from '@/lib/types/database';

// ============================================================
// Types
// ============================================================

type GpsStatus = 'idle' | 'loading' | 'success' | 'error';
type FormStatus = 'idle' | 'uploading' | 'submitting' | 'success' | 'error';

const CATEGORY_OPTIONS: { value: IncidentCategory; label: string }[] = [
  { value: 'accident', label: 'Tabrakan / Kecelakaan Mobil' },
  { value: 'breakdown', label: 'Kendaraan Mogok / Ban Bocor' },
  { value: 'debris', label: 'Puing / Benda Asing di Jalan' },
  { value: 'weather', label: 'Cuaca Ekstrem / Banjir' },
  { value: 'other', label: 'Kategori Lain' },
];

export default function ReportForm() {
  // ---- States ----
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string>('');

  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('accident');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  // Native File Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ============================================================
  // GPS Logic
  // ============================================================
  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Browser tidak mendukung GPS.');
      return;
    }
    setGpsStatus('loading');
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsStatus('success');
      },
      (error) => {
        setGpsStatus('error');
        setGpsError('Gagal mendeteksi lokasi otomatis. Mohon izinkan akses Lokasi Browser.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestGpsLocation();
  }, [requestGpsLocation]);

  // ============================================================
  // Upload Proxy Handler 
  // ============================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const _url = URL.createObjectURL(file);
      setPreviewUrl(_url);
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ============================================================
  // Form Submission
  // ============================================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (latitude === null || longitude === null) {
      setServerError('GPS belum tersedia. Tap tombol GPS untuk mencoba memuat lokasi.');
      return;
    }

    setServerError('');
    setFieldErrors({});
    let uploadedImageUrl = undefined;

    // Step 1: Upload Fot (Jika ada)
    if (selectedFile) {
      setFormStatus('uploading');
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData, // Tanpa mengatur json header, biarkan browser atur boundaries
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          setFormStatus('error');
          setServerError(uploadData.error || 'Gagal Upload Foto');
          return;
        }
        uploadedImageUrl = uploadData.data.url;
      } catch (err) {
        setFormStatus('error');
        setServerError('Sinyal jelek, gagal mengunggah gambar barbuk.');
        return;
      }
    }

    // Step 2: Kirim Laporan Insiden Inti
    setFormStatus('submitting');
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude,
          longitude,
          reporter_name: reporterName,
          reporter_phone: reporterPhone,
          image_url: uploadedImageUrl,
        }),
      });

      const data: CreateIncidentResponse | ApiErrorResponse = await response.json();

      if (!data.success) {
        const errorData = data as ApiErrorResponse;
        setFormStatus('error');
        setServerError(errorData.error.message);
        if (errorData.error.details) {
          setFieldErrors(errorData.error.details);
        }
      } else {
        const successData = data as CreateIncidentResponse;
        setFormStatus('success');
        setSuccessMessage(successData.data.message);
        
        // Clear forms
        setTitle('');
        setDescription('');
        setReporterName('');
        setReporterPhone('');
        removePhoto();
      }
    } catch {
      setFormStatus('error');
      setServerError('Sistem down. Coba beberapa saat lagi.');
    }
  };

  const getFieldError = (field: string) => fieldErrors[field]?.[0] || null;

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-12">
      {/* Messages */}
      {formStatus === 'success' && (
        <div className="mb-8 rounded-2xl border border-success/40 bg-success/10 p-5 animate-fade-in-up text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success mb-4 shadow-[0_0_20px_rgba(70,211,105,0.4)]">
            <Send className="h-8 w-8 text-black ml-1" />
          </div>
          <h3 className="text-xl font-bold text-success mb-2">Laporan Terkirim!</h3>
          <p className="text-text-primary mb-4">{successMessage}</p>
          <button onClick={() => setFormStatus('idle')} className="px-6 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm font-semibold">Buat Laporan Baru</button>
        </div>
      )}

      {formStatus === 'error' && serverError && (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-5 animate-fade-in-up flex gap-4 items-start">
          <AlertCircle className="h-6 w-6 text-danger mt-1 shrink-0" />
          <p className="text-text-primary leading-relaxed">{serverError}</p>
        </div>
      )}

      {formStatus !== 'success' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Card 1: GPS Panel */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xl animate-fade-in-up">
            <div className="flex items-center gap-4">
               <div className={`flex items-center justify-center shrink-0 w-12 h-12 rounded-full ${
                  gpsStatus === 'success' ? 'bg-success/20 text-success' : 
                  gpsStatus === 'error' ? 'bg-danger/20 text-danger' : 
                  'bg-primary/20 text-primary animate-pulse-glow'}`}>
                  <Navigation className={`w-6 h-6 ${gpsStatus === 'loading' ? 'animate-bounce' : ''}`} />
               </div>
               <div className="flex-1">
                 <h2 className="text-base font-bold text-text-primary">
                    {gpsStatus === 'loading' ? 'Mencari Lokasi...' : 
                     gpsStatus === 'success' ? 'Koordinat Terkunci' : 'GPS Error'}
                 </h2>
                 {gpsStatus === 'success' && latitude ? (
                   <p className="text-xs text-success font-mono mt-1 opacity-80">{latitude.toFixed(5)}, {longitude?.toFixed(5)}</p>
                 ) : (
                   <p className="text-xs text-text-muted mt-1 leading-tight">Data akurat penting untuk rute ambulans</p>
                 )}
               </div>
               {(gpsStatus === 'error' || gpsStatus === 'idle') && (
                 <button type="button" onClick={requestGpsLocation} className="p-3 bg-primary/20 text-primary rounded-xl font-semibold text-sm">On GPS</button>
               )}
            </div>
          </div>

          {/* Card 2: Foto Bukti JEMPOL UX (Upload File) */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xl animate-fade-in-up delay-100">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
               <Camera className="w-5 h-5 text-primary" /> FOTO KEJADIAN <span className="opacity-50 font-normal lowercase">(Wajib untuk Petugas)</span>
            </h2>
            
            {/* Box Upload */}
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center py-10 px-4 bg-background border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl cursor-pointer">
                <Camera className="w-10 h-10 text-text-muted mb-3" />
                <span className="text-text-primary font-semibold text-center text-lg">Ambil Foto BarBuk</span>
                <span className="text-text-muted text-sm text-center mt-1">Gunakan Kamera HP / Galeri. Max 5MB.</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  capture="environment" // Ini perintah magis biar HP buka Kamera Belakang
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-border bg-background flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview Foto" className="w-full object-cover max-h-64 opacity-90" />
                <button type="button" onClick={removePhoto} className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-transform active:scale-95">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            )}
            {getFieldError('image_url') && <p className="text-danger text-sm mt-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {getFieldError('image_url')}</p>}
          </div>

          {/* Card 3: Form Inti Insiden */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xl animate-fade-in-up delay-200">
             <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-primary" /> DETAIL INSIDEN
            </h2>

            <div className="space-y-6">
               <div>
                  <select id="category" value={category} onChange={e => setCategory(e.target.value as IncidentCategory)} className="w-full bg-background border border-border text-lg font-medium p-4 rounded-xl cursor-pointer focus:ring-2 focus:ring-primary h-14">
                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
               </div>

               <div>
                  <label className="text-sm text-text-secondary font-medium px-1 block mb-2">Kasus Apa? (Singkat) *</label>
                  <input type="text" placeholder="Cth: Laka Tunggal Ertiga KM 42" required value={title} onChange={e => setTitle(e.target.value)} className={`w-full bg-background border ${getFieldError('title') ? 'border-danger' : 'border-border'} text-base p-4 rounded-xl placeholder:text-text-muted focus:ring-2 focus:ring-primary transition-all`} />
                  {getFieldError('title') && <p className="text-danger text-xs mt-1.5 px-1">{getFieldError('title')}</p>}
               </div>

               <div>
                  <label className="text-sm text-text-secondary font-medium px-1 block mb-2">Situasi Korban & Lalin *</label>
                  <textarea rows={3} placeholder="Jelaskan kondisi ringkas..." required value={description} onChange={e => setDescription(e.target.value)} className={`w-full bg-background border ${getFieldError('description') ? 'border-danger' : 'border-border'} text-base p-4 rounded-xl resize-none placeholder:text-text-muted focus:ring-2 focus:ring-primary`} />
                  {getFieldError('description') && <p className="text-danger text-xs mt-1.5 px-1">{getFieldError('description')}</p>}
               </div>
            </div>
          </div>

           {/* Card 4: Identitas Pelapor */}
           <div className="bg-surface rounded-2xl border border-border p-5 shadow-xl animate-fade-in-up delay-300">
             <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
               <User className="w-5 h-5 text-primary" /> KONTAK PELAPOR
            </h2>
            <div className="space-y-6">
              <div>
                <input type="text" placeholder="Nama Panggilan / Lengkap" required value={reporterName} onChange={e => setReporterName(e.target.value)} className={`w-full bg-background border ${getFieldError('reporter_name') ? 'border-danger' : 'border-border'} text-base p-4 rounded-xl placeholder:text-text-muted`} />
                {getFieldError('reporter_name') && <p className="text-danger text-xs mt-1.5 px-1">{getFieldError('reporter_name')}</p>}
              </div>
              <div>
                <input type="tel" placeholder="Nomor WA (08xxxxx)" required value={reporterPhone} onChange={e => setReporterPhone(e.target.value)} className={`w-full bg-background border ${getFieldError('reporter_phone') ? 'border-danger' : 'border-border'} text-base p-4 rounded-xl placeholder:text-text-muted`} />
                {getFieldError('reporter_phone') && <p className="text-danger text-xs mt-1.5 px-1">{getFieldError('reporter_phone')}</p>}
              </div>
            </div>
          </div>

          {/* FAT SUBMIT BUTTON */}
          <div className="pt-2 animate-fade-in-up delay-400 sticky bottom-4 z-10 w-full drop-shadow-2xl">
            <button
              type="submit"
              disabled={formStatus === 'submitting' || formStatus === 'uploading' || gpsStatus !== 'success'}
              className={`flex items-center justify-center gap-3 w-full p-5 rounded-2xl text-lg font-bold text-white transition-all 
                ${gpsStatus !== 'success' ? 'bg-surface-light text-text-muted border-border cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover hover:-translate-y-1 shadow-[0_10px_40px_rgba(229,9,20,0.4)] active:scale-95'}
              `}
            >
              {formStatus === 'uploading' ? (
                <><span className="animate-spin rounded-full border-4 border-white/20 border-t-white w-6 h-6" /> Mengunggah Foto BarBuk...</>
              ) : formStatus === 'submitting' ? (
                 <><span className="animate-spin rounded-full border-4 border-white/20 border-t-white w-6 h-6" /> Mengirim SOS Sistem...</>
              ) : (
                <>SEBARKAN LAPORAN SOS <ChevronRight className="w-6 h-6" /></>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
