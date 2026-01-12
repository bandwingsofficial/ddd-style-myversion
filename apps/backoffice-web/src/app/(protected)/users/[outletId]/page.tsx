'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Mail, ShieldCheck, Key, Plus, X, 
  Loader2, RefreshCw, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';
import { UsersService } from '@/features/users/users.service';

export default function OutletUsersPage() {
  const { outletId } = useParams<{ outletId: string }>();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // New States for requested features
  const [showPass, setShowPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const adminId = 'SUPER_ADMIN_ID_FROM_SESSION';

  useEffect(() => {
    fetchUsers();
  }, [outletId]);

  // Success message auto-hide
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  async function fetchUsers() {
    setLoading(true);
    const res = await UsersService.getUsersByOutlet(outletId);
    setUsers(res.data.data);
    setLoading(false);
  }

  async function createUser() {
    setError(null);
    try {
      await UsersService.createUser({
        outletId,
        email,
        password,
        adminId,
      });
      setShowCreate(false);
      setEmail('');
      setPassword('');
      setSuccessMsg('User created successfully!');
      fetchUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create user');
    }
  }

  async function resetPassword() {
    setError(null);
    try {
      await UsersService.resetPassword(resetEmail!, newPassword);
      setResetEmail(null);
      setNewPassword('');
      setSuccessMsg('Password updated successfully!');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reset password');
    }
  }

  // Toggle User Status Logic Fixed
  async function toggleUserStatus(user: any) {
    try {
      // Correcting method calls based on your service's available methods
      if (user.isActive) {
        await UsersService.disableUser(user.id);
      } else {
        await UsersService.enableUser(user.id);
      }
      
      setSuccessMsg(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (e: any) {
      setSuccessMsg('Failed to update status');
    }
  }

  if (loading) return (
    <div style={styles.loaderContainer}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <RefreshCw size={40} color="#10b981" />
      </motion.div>
      <p style={{ marginTop: 12, color: "#64748b", fontWeight: 500 }}>Fetching users...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={styles.toast}
          >
            <CheckCircle2 size={18} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div style={styles.header}>
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 style={styles.title}>Outlet Users</h1>
          <p style={styles.subtitle}>Manage accounts created under this location</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowCreate(true); setShowPass(false); }}
          style={styles.greenPopButton}
        >
          <Plus size={18} /> Create User
        </motion.button>
      </div>

      {/* TABLE */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>USER EMAIL</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th} align="right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {users.map((u) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={u.id} 
                  style={styles.tr}
                >
                  <td style={styles.td}>
                    <div style={styles.nameGroup}>
                      <div style={styles.iconCircle}><Mail size={16} color="#10b981"/></div>
                      <span style={styles.emailText}>{u.email}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ ...styles.statusBadge, color: u.isActive ? '#059669' : '#64748b' }}>
                        <div style={{ ...styles.dot, backgroundColor: u.isActive ? '#10b981' : '#94a3b8' }} />
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                      {/* Toggle Switch */}
                      <button 
                        onClick={() => toggleUserStatus(u)}
                        style={{
                          ...styles.toggleBg,
                          backgroundColor: u.isActive ? '#10b981' : '#cbd5e1'
                        }}
                      >
                        <motion.div 
                          animate={{ x: u.isActive ? 18 : 2 }}
                          style={styles.toggleDot} 
                        />
                      </button>
                    </div>
                  </td>
                  <td style={styles.td} align="right">
                    <motion.button
                      whileHover={{ backgroundColor: '#f1f5f9' }}
                      onClick={() => { setResetEmail(u.email); setShowPass(false); }}
                      style={styles.actionBtn}
                    >
                      <Key size={14} style={{ marginRight: 6 }} /> Reset Password
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Outlet User" onClose={() => setShowCreate(false)}>
            {error && <Error text={error} />}
            <div style={styles.formStack}>
              <div style={styles.inputWrapper}>
                <input 
                  style={styles.input} 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div style={styles.passwordContainer}>
                <input 
                  style={styles.input} 
                  placeholder="Password" 
                  type={showPass ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  onClick={() => setShowPass(!showPass)} 
                  style={styles.eyeBtn}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PrimaryButton onClick={createUser}>Create Account</PrimaryButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* RESET PASSWORD MODAL */}
      <AnimatePresence>
        {resetEmail && (
          <Modal title="Reset Password" onClose={() => setResetEmail(null)}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Setting new password for: <strong>{resetEmail}</strong>
            </p>
            {error && <Error text={error} />}
            <div style={styles.formStack}>
              <div style={styles.passwordContainer}>
                <input 
                  style={styles.input} 
                  placeholder="New Password" 
                  type={showPass ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
                <button 
                  onClick={() => setShowPass(!showPass)} 
                  style={styles.eyeBtn}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PrimaryButton onClick={resetPassword}>Update Password</PrimaryButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- helper components ---------- */

function Modal({ title, children, onClose }: any) {
  return (
    <div style={styles.overlay}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={styles.modalBody}
      >
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={18}/></button>
        </div>
        {children}
        <button onClick={onClose} style={styles.cancelLink}>Cancel and Close</button>
      </motion.div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={styles.greenPopButtonLarge}
    >
      {children}
    </motion.button>
  );
}

function Error({ text }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={styles.errorBanner}>
      <AlertCircle size={14} style={{ marginRight: 6 }} /> {text}
    </motion.div>
  );
}

const AlertCircle = ({ size, style }: any) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

/* ---------- professional styles ---------- */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '40px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px'
  },
  title: { fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' },
  greenPopButton: {
    background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em'
  },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '16px 24px' },
  nameGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconCircle: { 
    width: '32px', height: '32px', borderRadius: '8px', 
    backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' 
  },
  emailText: { fontWeight: 600, color: '#1e293b', fontSize: '14px' },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#f8fafc'
  },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  overlay: {
    position: 'fixed', inset: 0, 
    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modalBody: { 
    background: 'white', padding: '32px', borderRadius: '24px', 
    width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '20px', fontWeight: 700, margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
  formStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  passwordContainer: { position: 'relative', width: '100%' },
  eyeBtn: { 
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' 
  },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', 
    border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px'
  },
  greenPopButtonLarge: {
    background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
    color: 'white', border: 'none', padding: '14px', borderRadius: '14px',
    fontWeight: 700, cursor: 'pointer', marginTop: '8px', width: '100%',
    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
  },
  cancelLink: {
    width: '100%', background: 'none', border: 'none', color: '#94a3b8',
    fontSize: '13px', marginTop: '16px', cursor: 'pointer'
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', padding: '10px 14px', 
    backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '10px', 
    fontSize: '13px', marginBottom: '16px', border: '1px solid #fee2e2'
  },
  loaderContainer: {
    height: '100vh', display: 'flex', flexDirection: 'column', 
    alignItems: 'center', justifyContent: 'center'
  },
  toast: {
    position: 'fixed', left: '50%', top: '20px', transform: 'translateX(-50%)',
    background: '#1e293b', color: '#fff', padding: '12px 24px', borderRadius: '50px',
    display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2000,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '14px', fontWeight: 500
  },
  toggleBg: {
    width: '38px', height: '20px', borderRadius: '20px', border: 'none',
    position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
  },
  toggleDot: {
    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
    position: 'absolute', top: '2px', left: 0
  }
};