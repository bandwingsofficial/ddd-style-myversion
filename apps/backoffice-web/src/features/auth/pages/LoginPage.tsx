'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '../hooks/useLogin';
import { motion } from 'framer-motion';
// Ideally, use an icon library like lucide-react in the future
// import { ArrowRight, AlertCircle } from 'lucide-react'; 

export function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = await login({ email, password });
    if (!data) return;
    sessionStorage.setItem('mfa_challenge_id', data.challengeId);
    router.push('/auth/verify');
  }

  return (
    // 1. PAGE CONTAINER
    // Uses your theme's background color and centers content
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans text-foreground">
      
      {/* 2. ANIMATED CARD WRAPPER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[380px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        
        {/* 3. DECORATIVE HEADER */}
        {/* Uses the primary color from your CSS variables for the gradient */}
        <div className="relative flex h-28 flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          {/* Subtle texture overlay or noise could go here */}
          <div className="flex flex-col items-center z-10">
            <span className="mb-1 text-[11px] font-bold uppercase tracking-[2px] opacity-80">
              Admin Panel
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              SECURE ACCESS
            </h2>
          </div>
        </div>

        {/* 4. FORM SECTION */}
        <div className="px-8 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Please enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* EMAIL INPUT */}
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-input/50 px-4 py-3.5 text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-input/50 px-4 py-3.5 text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  NEXT
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </motion.button>

            {/* ERROR MESSAGE */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg bg-destructive/10 p-3 text-center text-xs font-medium text-destructive"
              >
                {error.message}
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
      
      {/* Optional Footer/Copyright */}
      <div className="absolute bottom-6 text-xs text-muted-foreground opacity-50">
        &copy; 2026 Enterprise Admin. All rights reserved.
      </div>
    </div>
  );
}