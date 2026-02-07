"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestOtp } from "@/features/customer-auth/api/auth.api";
import { toast } from "sonner";
import Image from "next/image";

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

  return (
    // h-screen and overflow-hidden removes the scrollbar
    <div className="relative h-screen w-full flex items-center justify-start overflow-hidden">
      
      {/* Background Image */}
      <Image
        src="/images/login1.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* Glassmorphism Card - Reduced width and padding */}
      <main className="relative z-10 w-[90%] max-w-[400px] ml-6 md:ml-20 backdrop-blur-md bg-white/30 rounded-[35px] border border-white/40 shadow-2xl p-6 md:p-8">
        
        {/* Logo Section */}
        <div className="mb-6 flex items-start gap-1">
          <h2 className="text-xl font-black text-[#1a3014] leading-tight tracking-tighter">
            CANE<br />TENDER
          </h2>
          <div className="w-2.5 h-2.5 bg-[#47A851] rounded-full mt-1" />
        </div>

        {/* Content - Font sizes reduced to ~15px-16px range */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-[#1a3014]">Welcome back!</h1>
          <p className="text-[#2D4A22] text-[15px] leading-snug font-medium opacity-90">
            Login to continue enjoying the freshest sugarcane and coconut juices.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div 
              className={`flex items-center bg-white/60 rounded-xl overflow-hidden transition-all h-11 border border-white/20
                ${error ? 'ring-1 ring-red-400' : 'focus-within:ring-1 focus-within:ring-emerald-500'}`}
            >
              <div className="pl-3 pr-2 flex items-center gap-1 border-r border-gray-400/30">
                <span className="text-[15px] font-bold text-gray-700">+91</span>
                <svg width="8" height="5" viewBox="0 0 12 8" fill="none" className="text-gray-500">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                  if (error) setError(null);
                }}
                className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] font-semibold text-gray-800 placeholder:text-gray-500/70"
              />
            </div>
            {error && <span className="text-red-600 text-[10px] font-bold ml-1 uppercase">{error}</span>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || phone.length !== 10}
            className={`
              w-full py-2.5 rounded-full text-[16px] font-bold transition-all
              ${loading || phone.length !== 10 
                ? 'bg-gray-400/40 text-white cursor-not-allowed' 
                : 'bg-[#47A851] hover:bg-[#3d9145] text-white shadow-md active:scale-95'}
            `}
          >
            {loading ? "Wait..." : "Login"}
          </button>
        </div>
      </main>
    </div>
  );
}