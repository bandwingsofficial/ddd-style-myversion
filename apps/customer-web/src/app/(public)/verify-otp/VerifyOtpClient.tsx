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
    } catch {
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
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      
      {/* Background Image (Same as Login) */}
      <Image
        src="/images/login2.png"
        alt="Sugarcane field background"
        fill
        priority
        className="object-cover"
      />

      {/* Glass Panel (Exact copy of Login Page styling) */}
      <div className="relative z-10 w-[420px] max-w-[92%]">
        <div
          className="
            rounded-[26px]
            border border-white/30
            bg-gradient-to-b from-black/60 to-black/40
            backdrop-blur-xl
            shadow-[0_30px_90px_rgba(0,0,0,0.75)]
            px-10 py-12
          "
        >
          {/* Brand Header */}
          <div className="text-center mb-10">
            <h1 className="text-xl font-extrabold tracking-[0.35em] text-white drop-shadow">
              CANE&nbsp;TENDER
            </h1>
            <p className="text-[11px] tracking-[0.45em] text-white/80 mt-3 uppercase">
              Verification
            </p>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            
            {/* Info Text */}
            <div className="text-center space-y-2">
              <p className="text-white/80 text-xs tracking-widest uppercase">
                Enter code sent to
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-white text-sm font-bold tracking-wider">
                  +91 {displayPhone}
                </span>
                <button 
                  onClick={() => router.back()}
                  className="text-[#47A851] text-[10px] font-bold uppercase tracking-wide hover:text-white transition-colors"
                >
                  (Edit)
                </button>
              </div>
            </div>

            {/* OTP Input Container */}
            <div className="space-y-3">
              <div className={`
                flex items-center
                h-14
                rounded-xl
                border border-white/30
                bg-black/50
                px-4
                transition
                ${error ? "border-red-400" : "focus-within:border-[#47A851]"}
              `}>
                <input
                  ref={inputRef}
                  type="tel"
                  value={otp}
                  onChange={handleOtpChange}
                  onKeyDown={handleKeyPress}
                  placeholder="••••••"
                  maxLength={6}
                  className="
                    w-full
                    bg-transparent
                    outline-none
                    text-white
                    text-2xl
                    font-bold
                    tracking-[0.5em]
                    text-center
                    placeholder:text-white/20
                    placeholder:tracking-[0.2em]
                  "
                />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-xs tracking-wide font-medium text-center">
                  {error}
                </p>
              )}
            </div>

            {/* Verify Button (Rectangular Pill version of the Login Circle) */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="
                w-full h-14 rounded-full
                bg-[#47A851]
                text-white text-xs font-bold uppercase tracking-widest
                shadow-[0_0_35px_#47A851]
                hover:brightness-110
                active:scale-95
                transition
                disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed
                mt-4
              "
            >
              {loading ? "Verifying..." : "Verify & Proceed"}
            </button>

            {/* Timer / Resend Link */}
            <div className="mt-6 text-center">
              {!canResend ? (
                 <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase">
                   Resend code in <span className="text-white font-bold">{timer.toString().padStart(2, "0")}s</span>
                 </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[10px] tracking-[0.2em] text-[#47A851] uppercase font-bold hover:text-white transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Base Glow (Same as Login) */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-[#47A851] blur-2xl opacity-50 rounded-full" />
      </div>
    </div>
  );
}