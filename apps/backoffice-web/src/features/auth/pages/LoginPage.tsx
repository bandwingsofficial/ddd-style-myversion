'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '../hooks/useLogin';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        // Reduced max-width from 1000px to 850px and added a max-height
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
            
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Welcome Back,</h1>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Super Admin</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USERNAME/EMAIL INPUT */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                type="email"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-4 text-sm outline-none transition-all focus:border-[#10a353] focus:bg-white focus:ring-4 focus:ring-[#10a353]/10"
              />
            </div>

           {/* PASSWORD INPUT */}
<div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  </span>
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 py-4 text-sm outline-none transition-all focus:border-[#10a353] focus:bg-white focus:ring-4 focus:ring-[#10a353]/10"
  />
</div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-[#10a353] py-4 text-sm font-bold text-white shadow-lg shadow-[#10a353]/20 transition-all hover:bg-[#0d8a45] hover:shadow-[#10a353]/30 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
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
          </form>

          {/* INTERNAL FOOTER (Matches your screenshot position) */}
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] font-medium text-gray-400">
            &copy; 2026 Cane & Tender Admin. All rights reserved.
          </div>
        </div>
      </motion.div>
    </div>
  );
}