"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOtp } from "@/features/customer-auth/hooks/useVerifyOtp";
import { useSession } from "@/features/customer-auth/hooks/useSession";

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPhone = searchParams.get("phone");
  const phone = rawPhone?.startsWith("+") ? rawPhone : `+91${rawPhone}`;

  const verifyOtp = useVerifyOtp();
  const fetchSession = useSession(); // ✅ FIX: use as function

  const inputRef = useRef<HTMLInputElement>(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

      // ✅ hydrate session using existing hook
      await fetchSession();

      router.replace("/home");
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
    if (error) setError(null);
  };

  return (
    <div className="verify-wrapper">
      <h1>Verify OTP</h1>

      <input
        ref={inputRef}
        value={otp}
        onChange={handleOtpChange}
        maxLength={6}
        placeholder="Enter OTP"
      />

      {error && <p className="error">{error}</p>}

      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>

      {!canResend && <p>Resend in {timer}s</p>}
    </div>
  );
}
