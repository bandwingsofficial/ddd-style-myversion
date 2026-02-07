"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOtp } from "@/features/customer-auth/hooks/useVerifyOtp";
import { useSession } from "@/features/customer-auth/hooks/useSession";
import { requestOtp } from "@/features/customer-auth/api/auth.api";
import { toast } from "sonner";
import Image from "next/image";

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
    <div className="relative h-screen w-full flex items-center justify-start overflow-hidden">
      
      {/* Background Image */}
      <Image
        src="/images/login1.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* Glassmorphism Card */}
      <main className="relative z-10 w-[90%] max-w-[340px] ml-6 md:ml-20 backdrop-blur-md bg-white/30 rounded-[35px] border border-white/40 shadow-2xl p-6 md:p-8">
        
        {/* Logo Section */}
        <div className="mb-6 flex items-start gap-1">
          <h2 className="text-xl font-black text-[#1a3014] leading-tight tracking-tighter">
            CANE<br />TENDER
          </h2>
          <div className="w-2.5 h-2.5 bg-[#47A851] rounded-full mt-1" />
        </div>

        {/* Header Content */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-[#1a3014]">Verification</h1>
          <p className="text-[#2D4A22] text-[15px] leading-snug font-medium opacity-90">
            Enter code sent to <span className="font-bold">+91 {displayPhone}</span>
          </p>
          <button 
            onClick={() => router.back()} 
            className="text-[13px] text-[#47A851] font-bold hover:underline transition-colors"
          >
            Wrong number?
          </button>
        </div>

        {/* OTP Input Field */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div 
              className={`flex items-center bg-white/60 rounded-xl overflow-hidden transition-all h-12 border border-white/20
                ${error ? 'ring-1 ring-red-400' : 'focus-within:ring-1 focus-within:ring-emerald-500'}`}
            >
              <input
                ref={inputRef}
                type="tel"
                value={otp}
                onChange={handleOtpChange}
                onKeyDown={handleKeyPress}
                maxLength={6}
                placeholder="••••••"
                disabled={loading}
                className="w-full h-full text-center text-xl font-bold tracking-[0.3em] text-gray-800 placeholder:text-gray-400/70 bg-transparent outline-none"
              />
            </div>
            {error && <span className="text-red-600 text-[10px] font-bold ml-1 uppercase">{error}</span>}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className={`
              w-full py-2.5 rounded-full text-[16px] font-bold transition-all
              ${loading || otp.length !== 6 
                ? 'bg-gray-400/40 text-white cursor-not-allowed' 
                : 'bg-[#47A851] hover:bg-[#3d9145] text-white shadow-md active:scale-95'}
            `}
          >
            {loading ? "Verifying..." : "Verify & Proceed"}
          </button>
        </div>

        {/* Timer / Resend Footer */}
        <div className="mt-6 text-center">
          {!canResend ? (
            <p className="text-[#2D4A22] text-[13px] font-semibold opacity-80">
              Resend code in <span className="text-[#47A851] tabular-nums font-bold">00:{timer.toString().padStart(2, '0')}</span>
            </p>
          ) : (
            <button 
              onClick={handleResend} 
              disabled={resendLoading}
              className="text-[#47A851] text-[13px] font-bold underline disabled:text-gray-400 transition-colors"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}