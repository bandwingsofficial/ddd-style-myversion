'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMfa } from '../hooks/useMfa';
import { motion } from 'framer-motion';

export function VerifyMfaPage() {
  const router = useRouter();
  const { verifyMfa, loading, error } = useMfa();

  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('mfa_challenge_id');
    if (!id) {
      router.replace('/auth/login');
      return;
    }
    setChallengeId(id);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challengeId) return;

    const success = await verifyMfa({
      challengeId,
      code,
    });

    if (!success) return;

    sessionStorage.removeItem('mfa_challenge_id');
    router.replace('/dashboard');
  }

  const colors = {
    primary: '#10b981',
    primaryDark: '#059669',
    white: '#ffffff',
    bg: 'radial-gradient(circle at center, #f0fdf4 0%, #ffffff 100%)',
    inputBg: '#f9fafb',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.bg,
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
    }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: colors.white,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9'
        }}
      >
        {/* COMPACT TOP SECTION */}
        <div style={{
          height: '110px',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.white
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            opacity: 0.9,
            marginBottom: '4px'
          }}>
            Identity Check
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>TWO-FACTOR AUTH</h2>
        </div>

        {/* FORM SECTION */}
        <div style={{ padding: '30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ color: '#111827', margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>VERIFY IT'S YOU</h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Enter the 6-digit code from your app</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="000 000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: colors.inputBg,
                fontSize: '20px',
                fontWeight: 'bold',
                letterSpacing: '8px',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !challengeId}
              style={{
                marginTop: '8px',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: colors.primary,
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: '0.2s all'
              }}
            >
              {loading ? 'VERIFYING...' : (
                <>
                  VERIFY
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </>
              )}
            </motion.button>

            {error && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '12px', 
                textAlign: 'center', 
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fee2e2'
              }}>
                {error.message}
              </p>
            )}
            
            <button 
              type="button" 
              onClick={() => router.replace('/auth/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '10px',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}