'use client';

/**
 * InciTrack — Login Page
 * 
 * Halaman Otentikasi bergaya Netflix Dark Theme.
 * Digunakan untuk Admin dan Petugas Jasa Marga.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createBrowserSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Kredensial tidak valid. Silakan periksa kembali email & password.');
        setIsLoading(false);
        return;
      }

      // Jika berhasil login, lemparkan paksa ke Dashboard.
      if (data.user) {
        router.push('/dashboard');
        router.refresh(); // Memaksa re-render server component termasuk navbar
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server autentikasi.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Glow (Netflix Vibe) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(229, 9, 20, 0.4) 0%, transparent 70%)'
        }} 
      />

      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
           <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-4 text-primary">
             <LogIn size={32} />
           </div>
           <h1 className="text-2xl font-bold text-white mb-1">InciTrack Secure</h1>
           <p className="text-text-muted text-sm">Otentikasi Portal Petugas Jalan Tol</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 bg-danger/10 border border-danger/30 rounded-xl p-4 flex gap-3 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5 px-1">
              Alamat Email Petugas
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@incitrack.com"
              className="w-full p-4 bg-background border border-border rounded-xl text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5 px-1">
              Kata Sandi
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-background border border-border rounded-xl text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-4 p-4 rounded-xl text-white font-bold text-base transition-all
              ${isLoading 
                ? 'bg-surface-light text-text-muted cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] active:scale-[0.98]'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full border-2 border-white/20 border-t-white w-5 h-5" /> 
                Verifikasi Sesi...
              </span>
            ) : 'Akses Portal Control Center'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-xs text-text-muted">
            Sistem ini dilindungi oleh otentikasi internal Supabase SSR.<br /> 
            Jika lupa kata sandi, hubungi IT Administrator Pusat.
          </p>
        </div>
      </div>
    </main>
  );
}
