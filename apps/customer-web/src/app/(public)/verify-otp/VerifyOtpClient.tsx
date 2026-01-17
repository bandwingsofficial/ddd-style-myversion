"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOtp } from "@/features/customer-auth/hooks/useVerifyOtp";
import { useSession } from "@/features/customer-auth/hooks/useSession";
// Importing API for the Resend functionality
import { requestOtp } from "@/features/customer-auth/api/auth.api";

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPhone = searchParams.get("phone");
  // Clean up phone display
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
      await fetchSession(); // Hydrate session

      router.replace("/home");
    } catch (err: any) {
      setError(err?.message || "Invalid OTP. Please try again.");
      setOtp(""); // Clear invalid OTP for better UX
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
      
      // Reset Timer
      setTimer(60);
      setCanResend(false);
      setOtp("");
      inputRef.current?.focus();
    } catch (err) {
      setError("Failed to resend OTP. Try again later.");
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
    <div className="verify-wrapper">
      <div className="verify-card">
        
        {/* Brand Header */}
        <header className="brand-header">
          <div className="logo-icons">
            <span className="icon">🥤</span>
            <span className="icon">🎋</span>
          </div>
          <h1 className="brand-name">Sugarcane Fresh</h1>
        </header>

        <section className="form-content">
          <div className="text-center mb-6">
            <h2 className="welcome-text">Verification</h2>
            <p className="sub-text">
              We sent a code to <span className="highlight-phone">+91 {displayPhone}</span>
              <br />
              <button onClick={() => router.back()} className="edit-link">
                (Wrong number?)
              </button>
            </p>
          </div>

          <div className="input-container">
            <div className={`input-wrapper ${error ? "input-error" : ""}`}>
              <input
                ref={inputRef}
                value={otp}
                onChange={handleOtpChange}
                onKeyPress={handleKeyPress}
                maxLength={6}
                placeholder="• • • • • •"
                className="otp-input"
                disabled={loading}
              />
            </div>

            {error && <p className="error-text">{error}</p>}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="cta-button"
          >
            {loading ? <span className="loader"></span> : "Verify & Proceed"}
            {!loading && <span className="arrow">→</span>}
          </button>

          {/* Timer & Resend Section */}
          <div className="timer-container">
            {!canResend ? (
              <p className="timer-text">
                Resend code in <span className="countdown">00:{timer.toString().padStart(2, '0')}</span>
              </p>
            ) : (
              <button 
                onClick={handleResend} 
                disabled={resendLoading}
                className="resend-btn"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </section>

        <footer className="card-footer">
            <div className="support-badge">
             <span className="support-icon">🔒</span>
             <span>Secure Authentication</span>
           </div>
        </footer>
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
          max-width: 380px;
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .brand-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icons {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .brand-name {
          color: #15803d;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .welcome-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .sub-text {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .highlight-phone {
          color: #1e293b;
          font-weight: 600;
        }

        .edit-link {
          background: none;
          border: none;
          color: #16a34a;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .input-container {
          margin: 2rem 0 1.5rem 0;
        }

        .input-wrapper {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
          padding: 0.5rem;
        }

        .input-wrapper:focus-within {
          border-color: #22c55e;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }
        
        .input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .otp-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          letter-spacing: 0.75rem; /* This gives the "separate box" look */
          outline: none;
          padding: 0.5rem;
        }
        
        .otp-input::placeholder {
           color: #cbd5e1;
           letter-spacing: 0.75rem;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.75rem;
          text-align: center;
          font-weight: 500;
          background: #fef2f2;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .cta-button {
          width: 100%;
          padding: 0.875rem;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .cta-button:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
        }

        .cta-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .timer-container {
          margin-top: 1.5rem;
          text-align: center;
          height: 24px; /* Fixed height to prevent layout jump */
        }

        .timer-text {
          font-size: 0.875rem;
          color: #64748b;
        }

        .countdown {
          color: #16a34a;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .resend-btn {
          background: none;
          border: none;
          color: #16a34a;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .resend-btn:hover:not(:disabled) {
          color: #15803d;
          text-decoration: underline;
        }
        
        .resend-btn:disabled {
           color: #94a3b8;
           cursor: wait;
        }

        .card-footer {
          margin-top: 2rem;
          text-align: center;
          border-top: 1px solid #f1f5f9;
          padding-top: 1.5rem;
        }

        .support-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .loader {
          width: 18px;
          height: 18px;
          border: 2px solid #ffffff;
          border-bottom-color: transparent;
          border-radius: 50%;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}