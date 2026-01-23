"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOtp } from "@/features/customer-auth/hooks/useVerifyOtp";
import { useSession } from "@/features/customer-auth/hooks/useSession";
import { requestOtp } from "@/features/customer-auth/api/auth.api";
import { toast } from "sonner"; // Assuming you have sonner for consistency

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPhone = searchParams.get("phone");
  const displayPhone = rawPhone?.replace("+91", "") || "";
  const phone = rawPhone?.startsWith("+") ? rawPhone : `+91${rawPhone}`;

  const verifyOtp = useVerifyOtp();
  const fetchSession = useSession();

  const inputRef = useRef<HTMLInputElement>(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleVerify = async () => {
    if (!phone || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await verifyOtp(phone, otp);
      await fetchSession();

      router.replace("/home");
      toast.success("Welcome back!");
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
      setOtp(""); 
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    try {
      setResendLoading(true);
      setError(null);
      await requestOtp(phone);
      
      setTimer(60);
      setCanResend(false);
      setOtp("");
      inputRef.current?.focus();
      toast.success("Code resent successfully");
    } catch (err) {
      setError("Failed to resend. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (error) setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && otp.length === 6) handleVerify();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      
      {/* Card Container */}
      <main className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">
        
        {/* Top Accent Bar */}
        <div className="h-1 w-full bg-emerald-600" />

        <div className="px-6 py-8">
          
          {/* Header */}
          <header className="flex flex-col items-center mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
               {/* Lock Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
               </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Verification</h1>
            
            <div className="text-center mt-2">
              <p className="text-xs text-slate-500 font-medium">
                Enter code sent to <span className="text-slate-900 font-semibold">+91 {displayPhone}</span>
              </p>
              <button 
                onClick={() => router.back()} 
                className="text-[10px] text-emerald-600 font-semibold hover:text-emerald-700 hover:underline mt-0.5 transition-colors"
              >
                Wrong number?
              </button>
            </div>
          </header>

          {/* Form Content */}
          <div className="space-y-6">
            
            {/* OTP Input */}
            <div>
              <div 
                className={`relative flex items-center justify-center bg-white border rounded-lg transition-all duration-200 h-14 overflow-hidden
                  ${error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10'}
                `}
              >
                <input
                  ref={inputRef}
                  value={otp}
                  onChange={handleOtpChange}
                  onKeyDown={handleKeyPress}
                  maxLength={6}
                  placeholder="------"
                  disabled={loading}
                  className="w-full h-full text-center text-2xl font-bold tracking-[0.5em] text-slate-900 placeholder:text-slate-200 border-none outline-none bg-transparent pt-1"
                  style={{ paddingLeft: '0.5em' }} // Visual fix for tracking
                />
              </div>

              {/* Error Message */}
              <div className="h-5 mt-1.5 flex justify-center">
                {error && (
                  <p className="text-[10px] font-medium text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
              <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className={`
                  w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200
                  ${loading || otp.length !== 6
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-[0.98]'}
                `}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & Proceed
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>

              {/* Timer / Resend */}
              <div className="text-center">
                {!canResend ? (
                  <p className="text-xs text-slate-400 font-medium">
                    Resend code in <span className="text-emerald-600 tabular-nums">00:{timer.toString().padStart(2, '0')}</span>
                  </p>
                ) : (
                  <button 
                    onClick={handleResend} 
                    disabled={resendLoading}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline disabled:text-slate-300 disabled:no-underline transition-colors"
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
             <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
               </svg>
               <span>Secure 256-bit Encrypted</span>
             </div>
          </footer>

        </div>
      </main>
    </div>
  );
}