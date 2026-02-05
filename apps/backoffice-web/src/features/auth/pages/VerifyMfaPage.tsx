'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMfa } from '../hooks/useMfa';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        // Using the same compact dimensions as your updated Login page
        className="flex w-full max-w-[850px] max-h-[550px] overflow-hidden rounded-[1.5rem] bg-white shadow-2xl"
      >
        
        {/* LEFT SIDE: IMAGE SECTION */}
        <div className="hidden md:block w-1/2 relative bg-[#d4f3e5]">
          <Image 
            src="/login2.jpg" 
            alt="Sugarcane and Coconut" 
            fill
            className="object-cover" 
            priority
          />
        </div>

        {/* RIGHT SIDE: FORM SECTION */}
        <div className="w-full md:w-1/2 px-8 py-10 lg:px-14 flex flex-col justify-center bg-white relative">
          
          {/* LOGO & TITLE */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#10a353]">
                 <span className="text-white font-black text-xl">S</span>
              </div>
              <div>
                <h2 className="text-xl font-black leading-none text-[#10a353] tracking-tight">Cane & Tender</h2>
                <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Super Admin</p>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Verify it's you</h1>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Enter the 6-digit code from your app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* MFA CODE INPUT */}
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000 000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4 text-center text-2xl font-black tracking-[0.3em] outline-none transition-all focus:border-[#10a353] focus:bg-white focus:ring-4 focus:ring-[#10a353]/10"
              />
            </div>

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={loading || !challengeId}
              className="w-full mt-2 rounded-xl bg-[#10a353] py-4 text-sm font-bold text-white shadow-lg shadow-[#10a353]/20 transition-all hover:bg-[#0d8a45] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "VERIFYING..." : "VERIFY ACCESS"}
              {!loading && (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              )}
            </button>

            {/* ERROR MESSAGE */}
            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center text-xs font-bold text-red-500 mt-2"
              >
                {error.message}
              </motion.p>
            )}

            {/* BACK TO LOGIN */}
            <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => router.replace('/auth/login')}
                  className="text-[10px] font-bold text-[#10a353] hover:text-[#0d8a45] transition-colors uppercase tracking-widest"
                >
                  Back to Login
                </button>
            </div>
          </form>

          {/* INTERNAL FOOTER */}
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] font-medium text-gray-400">
            &copy; 2026 Cane & Tender Admin. All rights reserved.
          </div>
        </div>
      </motion.div>
    </div>
  );
}