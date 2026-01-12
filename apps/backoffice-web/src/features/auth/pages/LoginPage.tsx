'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '../hooks/useLogin';
import { motion } from 'framer-motion';

export function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = await login({ email, password });
    if (!data) return;
    sessionStorage.setItem('mfa_challenge_id', data.challengeId);
    router.push('/auth/verify');
  }

  const colors = {
    primary: '#10b981', 
    primaryDark: '#059669',
    white: '#ffffff',
    // Clean, soft radial spotlight background
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
          height: '110px', // Reduced height
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
            Admin Panel
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>SECURE ACCESS</h2>
        </div>

        {/* COMPACT FORM SECTION */}
        <div style={{ padding: '30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ color: '#111827', margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>WELCOME!</h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: colors.inputBg,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: colors.inputBg,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <motion.button
  
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
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
              {loading ? '...' : (
                <>
                  NEXT
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </motion.button>

            {error && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '12px', 
                textAlign: 'center', 
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px'
              }}>
                {error.message}
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}