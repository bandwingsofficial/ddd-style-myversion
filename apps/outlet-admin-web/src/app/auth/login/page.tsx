'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { outletAuthService } from '@/features/auth/services/auth.service';

export default function OutletLoginPage() {
  const router = useRouter();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    
    if (!validateInputs()) return;

    try {
      setLoading(true);
      await outletAuthService.login({ email, password });
      router.replace('/dashboard');
    } catch (err: any) {
  // Do not log expected 401 login failures
  if (err?.response?.status !== 401) {
    console.error(err);
  }

  setError(
    err?.response?.data?.message ||
    "Invalid credentials. Please try again."
  );
  setLoading(false);
}

  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
      
      {/* CARD CONTAINER - Reduced max-width and rounded corners */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
      >
        
        {/* --- LEFT SIDE: IMAGE (Hidden on mobile) --- */}
        <div className="relative hidden w-1/2 bg-slate-900 md:block">
          {/* Assuming 'login.jpg' is in your public folder */}
          <img 
            src="/login.jpg" 
            alt="Outlet Login Cover" 
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
          />
          
          {/* Optional Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Quality & Freshness</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight">Pure Cane Goodness</h3>
          </div>
        </div>

        {/* --- RIGHT SIDE: FORM - Reduced padding --- */}
        <div className="flex w-full flex-col justify-center p-6 md:w-1/2 md:p-8 lg:p-10">
            
          {/* BRAND HEADER - Reduced margins and icon size */}
          <div className="mb-6 flex items-center gap-3">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={18} />
             </div>
             <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight text-slate-900">CanTen</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outlet Admin</span>
             </div>
          </div>

          {/* WELCOME TEXT - Reduced margins and font size */}
          <div className="mb-6">
             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back!</h1>
             <p className="mt-1 text-sm font-medium text-slate-500">
               Please enter your details to access the dashboard.
             </p>
          </div>

          {/* ERROR ALERT */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-center gap-2 overflow-hidden rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600"
              >
                <AlertCircle size={16} className="shrink-0" /> 
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOGIN FORM - Reduced gaps */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Email Field - Reduced height (py) */}
            <div className="group relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
              <input 
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Email address"
                type="email"
                disabled={loading}
                onChange={e => setEmail(e.target.value)} 
                value={email}
              />
            </div>

            {/* Password Field - Reduced height (py) */}
            <div className="group relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
              <input 
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                type="password" 
                placeholder="Password"
                disabled={loading}
                onChange={e => setPassword(e.target.value)} 
                value={password}
              />
            </div>

            {/* Submit Button - Reduced height (py) */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </motion.button>

          </form>

          {/* FOOTER - Reduced margin */}
          <div className="mt-6 text-center text-[10px] font-medium text-slate-400">
            &copy; {new Date().getFullYear()} CanTen Outlet. All rights reserved.
          </div>

        </div>
      </motion.div>
    </div>
  );
}