"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Ensure this hook/API exists in your project
import { useVerifyOtp } from "@/features/customer-auth/hooks/useVerifyOtp";

export default function VerifyOtpPage() {
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
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError(null);
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-card">
        {/* Header Section */}
        <header className="brand-header">
          <div className="shield-box">🔐</div>
          <h1 className="title">Verify OTP</h1>
          <p className="subtitle">Sent to <span>{phone || "+91 00000 00000"}</span></p>
        </header>

        {/* OTP Input UI */}
        <div className="input-section">
          <div className="otp-container">
            <input
              ref={inputRef}
              type="tel"
              value={otp}
              onChange={handleOtpChange}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              maxLength={6}
              className="hidden-input"
              disabled={loading}
              autoFocus
            />
            <div className="otp-visual-groups">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`otp-box ${otp[i] ? 'active' : ''} ${error ? 'error' : ''}`}>
                  {otp[i] || ""}
                </div>
              ))}
            </div>
          </div>
          
          {error && <p className="status-text error">{error}</p>}
        </div>

        {/* Action Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="cta-button"
        >
          {loading ? <span className="loader"></span> : "Verify & Continue"}
          {!loading && <span className="arrow">→</span>}
        </button>

        {/* Resend Logic */}
        <div className="resend-footer">
          <p>Didn't get the code?</p>
          <button 
            disabled={!canResend} 
            className="resend-link"
            onClick={() => { setTimer(30); setCanResend(false); }}
          >
            {canResend ? "Resend OTP" : `Resend in ${timer}s`}
          </button>
        </div>

        <button onClick={() => router.back()} className="back-link">
          ← Edit Phone Number
        </button>
      </div>

      <style jsx>{`
        .verify-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          padding: 1.5rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .verify-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          text-align: center;
        }

        .shield-box {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0.5rem 0 2rem 0;
        }

        .subtitle span {
          color: #1e293b;
          font-weight: 600;
        }

        /* OTP Input Styling */
        .otp-container {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .hidden-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: default;
        }

        .otp-visual-groups {
          display: flex;
          gap: 8px;
        }

        .otp-box {
          width: 45px;
          height: 54px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .otp-box.active {
          border-color: #22c55e;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .otp-box.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .status-text {
          font-size: 0.813rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .status-text.error { color: #ef4444; }

        .cta-button {
          width: 100%;
          padding: 0.875rem;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .cta-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .resend-footer {
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .resend-link {
          background: none;
          border: none;
          color: #16a34a;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.25rem;
          text-decoration: underline;
        }

        .resend-link:disabled {
          color: #94a3b8;
          text-decoration: none;
          cursor: default;
        }

        .back-link {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.813rem;
          margin-top: 2rem;
          cursor: pointer;
          font-weight: 500;
        }

        .back-link:hover { color: #1e293b; }

        .loader {
          width: 18px;
          height: 18px;
          border: 2px solid #fff;
          border-bottom-color: transparent;
          border-radius: 50%;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 400px) {
          .otp-box { width: 38px; height: 48px; }
        }
      `}</style>
    </div>
  );
}