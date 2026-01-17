"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOtp } from "@/features/customer-auth/hooks/useVerifyOtp";

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const inputRef = useRef<HTMLInputElement>(null);
  const verifyOtp = useVerifyOtp();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
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
      setTimeout(() => router.push("/home"), 300);
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError(null);
  };

  return (
    <div className="verify-wrapper">
      {/* 🔥 YOUR ENTIRE JSX + STYLE — UNCHANGED 🔥 */}
      {/* (exact same JSX + <style jsx> block as you sent) */}
    </div>
  );
}
