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
      setError("Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formattedPhone = `+91${phone}`;
      await requestOtp(formattedPhone);

      router.push(
        `/verify-otp?phone=${encodeURIComponent(formattedPhone)}${
          redirectUrl ? `&redirect=${redirectUrl}` : ""
        }`
      );

      toast.success("OTP sent successfully!");
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">

      {/* Background */}
      <Image
        src="/images/login2.png"
        alt="Sugarcane field background"
        fill
        priority
        className="object-cover"
      />

      {/* Glass Panel */}
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
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="text-xl font-extrabold tracking-[0.35em] text-white drop-shadow">
              CANTEN
            </h1>
            <p className="text-[11px] tracking-[0.45em] text-white/80 mt-3 uppercase">
              Sweet Sustenance
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-widest text-white/90 font-semibold">
              Phone Number
            </label>

            <div className="
              flex items-center
              h-14
              rounded-xl
              border border-white/30
              bg-black/50
              px-4
              focus-within:border-[#47A851]
              transition
            ">
              <span className="text-white text-sm font-bold pr-3 border-r border-white/30">
                +91
              </span>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (error) setError(null);
                }}
                placeholder="Enter phone number"
                className="
                  ml-4 w-full
                  bg-transparent
                  outline-none
                  text-white
                  text-base
                  tracking-widest
                  placeholder:text-white/50
                "
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs tracking-wide font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Login Button */}
          <div className="mt-12 flex flex-col items-center">
            <button
              onClick={handleSubmit}
              disabled={loading || phone.length !== 10}
              className="
                w-20 h-20 rounded-full
                bg-[#47A851]
                text-white text-xs font-bold uppercase tracking-widest
                shadow-[0_0_35px_#47A851]
                hover:brightness-110
                active:scale-95
                transition
                disabled:opacity-40
              "
            >
              {loading ? "..." : "Login"}
            </button>

            <span className="mt-5 text-[10px] tracking-[0.35em] text-white/70 uppercase">
              Touch to authenticate
            </span>
          </div>
        </div>

        {/* Base Glow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-[#47A851] blur-2xl opacity-50 rounded-full" />
      </div>
    </div>
  );
}
