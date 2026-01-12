'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Info, AlertCircle } from 'lucide-react';
import { outletAuthService } from '@/features/auth/services/auth.service';

export default function OutletLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI States
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(null);
    if (!validateInputs()) return;

    try {
      await outletAuthService.login({ email, password });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials.");
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={styles.card}
      >
        <div style={styles.iconCircle}>
          <ShieldCheck size={36} color="#10b981" />
        </div>

        <header style={styles.header}>
          <h1 style={styles.title}>Outlet Login</h1>
          <p style={styles.subtitle}>Secure access to your outlet dashboard</p>
        </header>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.errorBanner}
            >
              <AlertCircle size={16} style={{ marginRight: 8 }} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={styles.formGroup}>
          <div style={styles.inputWrapper}>
            <Mail size={18} style={styles.fieldIcon} />
            <input 
              style={styles.input}
              placeholder="Email address"
              onChange={e => setEmail(e.target.value)} 
              value={email}
            />
          </div>

          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.fieldIcon} />
            <input 
              style={styles.input}
              type={showPass ? "text" : "password"} 
              placeholder="Password"
              onChange={e => setPassword(e.target.value)} 
              value={password}
            />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)} 
              style={styles.eyeBtn}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div style={styles.tooltip}>
              <Info size={12} /> Min 8 characters
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            style={styles.gradientButton}
          >
            Login to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: '420px',
    padding: '48px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  iconCircle: {
    width: '72px',
    height: '72px',
    backgroundColor: '#ecfdf5',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
  },
  header: { marginBottom: '32px' },
  title: { fontSize: '30px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.025em' },
  subtitle: { color: '#64748b', fontSize: '15px', fontWeight: 500 },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '20px',
    border: '1px solid #fee2e2',
    overflow: 'hidden',
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputWrapper: { position: 'relative', textAlign: 'left' },
  fieldIcon: { position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' },
  input: {
    width: '78%',
    padding: '15px 48px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '16px',
    top: '15px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 0,
  },
  tooltip: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 500,
  },
  gradientButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)',
    marginTop: '10px',
    textTransform: 'none',
  }
};