"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Note: Ensure your api path is correct
import { requestOtp } from "@/features/customer-auth/api/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formattedPhone = `+91${phone}`;
      await requestOtp(formattedPhone);
      router.push(`/verify-otp?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Compact Logo & Title */}
        <header className="brand-header">
          <div className="logo-icons">
            <span className="icon">🥤</span>
            <span className="icon">🎋</span>
          </div>
          <h1 className="brand-name">Sugarcane Fresh</h1>
          <p className="brand-tagline">Pure & Natural Juice</p>
        </header>

        <section className="form-content">
          <div className="text-center mb-6">
            <h2 className="welcome-text">Welcome Back</h2>
            <p className="sub-text">Enter phone number to continue</p>
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <span className="prefix">+91</span>
              <input
                type="tel"
                placeholder="00000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyPress={handleKeyPress}
                maxLength={10}
                className="phone-input"
                disabled={loading}
              />
            </div>
            
            {error && <p className="error-text">{error}</p>}
            {!error && <p className="helper-text">A 6-digit OTP will be sent</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || phone.length !== 10}
            className="cta-button"
          >
            {loading ? <span className="loader"></span> : "Get OTP"}
            {!loading && <span className="arrow">→</span>}
          </button>
        </section>

        <footer className="card-footer">
          <p className="legal-text">
            By continuing, you agree to our <span>Terms & Privacy</span>
          </p>
          <div className="support-badge">
            <span className="support-icon">📞</span>
            <span>Support: 1800-SUGAR</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc; /* Professional Off-White */
          padding: 1.5rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .login-card {
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
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .brand-name {
          color: #15803d;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .brand-tagline {
          color: #22c55e;
          font-size: 0.813rem;
          font-weight: 500;
          margin-top: 0.25rem;
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
          margin-top: 0.25rem;
        }

        .input-container {
          margin: 1.5rem 0;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #22c55e;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        .prefix {
          padding-left: 1rem;
          font-weight: 600;
          color: #15803d;
          border-right: 1.5px solid #e2e8f0;
          padding-right: 0.75rem;
          font-size: 0.95rem;
        }

        .phone-input {
          flex: 1;
          border: none;
          padding: 0.875rem;
          font-size: 1rem;
          background: transparent;
          outline: none;
          color: #1e293b;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .helper-text {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.5rem;
          text-align: center;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          text-align: center;
          font-weight: 500;
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

        .card-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .legal-text {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 1.25rem;
        }

        .legal-text span {
          color: #16a34a;
          font-weight: 500;
          cursor: pointer;
        }

        .support-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f0fdf4;
          border-radius: 99px;
          color: #16a34a;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid #dcfce7;
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

        @media (max-width: 400px) {
          .login-card {
            padding: 2rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}