"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestOtp } from "@/features/customer-auth/api/auth.api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!phone || phone.length !== 10) {
      setError("Enter valid 10-digit number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formattedPhone = `+91${phone}`;
      
      await requestOtp(formattedPhone);
      
      const nextUrl = `/verify-otp?phone=${encodeURIComponent(formattedPhone)}${redirectUrl ? `&redirect=${redirectUrl}` : ""}`;
      
      router.push(nextUrl);
      toast.success("OTP sent successfully!");

    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      
      {/* Refined Card Container - Reduced Width & Height */}
      <main className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
        
        {/* Accent Bar */}
        <div className="h-1 w-full bg-emerald-600" />

        <div className="px-6 py-8">
          {/* Header - Compact & Professional */}
          <header className="flex flex-col items-center mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
               {/* Brand Icon (Leaf) */}
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 20h9"/>
                 <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
               </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sugarcane Fresh</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Sign in to your account</p>
          </header>

          {/* Form Content */}
          <div className="space-y-4">
            
            {/* Input Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1">Phone Number</label>
              <div 
                className={`flex items-center bg-white border rounded-lg transition-all duration-200
                  ${error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10'}
                `}
              >
                <div className="pl-3.5 pr-3 py-2.5 border-r border-slate-100 bg-slate-50/50 rounded-l-lg">
                  <span className="text-sm font-semibold text-slate-600">+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyPress}
                  maxLength={10}
                  disabled={loading}
                  className="flex-1 bg-transparent border-none outline-none px-3 text-slate-900 placeholder:text-slate-300 text-sm font-medium h-full py-2.5"
                />
              </div>
              
              {/* Error or Hint */}
              <div className="h-4 flex items-center px-1">
                {error ? (
                  <p className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400">We will send you a one-time password</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || phone.length !== 10}
              className={`
                w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200
                ${loading || phone.length !== 10 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-[0.98]'}
              `}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Get OTP
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Footer - Integrated and minimal */}
          <footer className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
              By continuing, you agree to our 
              <span className="text-emerald-600 font-medium cursor-pointer hover:underline mx-1">Terms</span> 
              and 
              <span className="text-emerald-600 font-medium cursor-pointer hover:underline mx-1">Privacy</span>
            </p>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              {/* Phone Icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Support: 1800-SUGAR</span>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}