'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMfa } from '../hooks/useMfa';
import { motion } from 'framer-motion';

export function VerifyMfaPage() {
  const router = useRouter();
  const { verifyMfa, loading, error } = useMfa();

  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('mfa_challenge_id');
    if (!id) {
      router.replace('/auth/login');
      return;
    }
    setChallengeId(id);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challengeId) return;

    const success = await verifyMfa({
      challengeId,
      code,
    });

    if (!success) return;

    sessionStorage.removeItem('mfa_challenge_id');
    router.replace('/dashboard');
  }

  return (
    // 1. PAGE CONTAINER
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans text-foreground">
      
      {/* 2. ANIMATED CARD WRAPPER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[380px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        
        {/* 3. DECORATIVE HEADER */}
        <div className="relative flex h-28 flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex flex-col items-center z-10">
            <span className="mb-1 text-[11px] font-bold uppercase tracking-[2px] opacity-80">
              Identity Check
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              TWO-FACTOR AUTH
            </h2>
          </div>
        </div>

        {/* 4. FORM SECTION */}
        <div className="px-8 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Verify it's you</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code from your app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* MFA CODE INPUT (Special Styling) */}
            <div className="space-y-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000 000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-2xl border border-input bg-input/30 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] transition-all placeholder:tracking-normal placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* VERIFY BUTTON */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              disabled={loading || !challengeId}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">VERIFYING...</span>
              ) : (
                <>
                  VERIFY ACCESS
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
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

            {/* BACK TO LOGIN LINK */}
            <button 
              type="button" 
              onClick={() => router.replace('/auth/login')}
              className="mx-auto text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              Back to Login
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}