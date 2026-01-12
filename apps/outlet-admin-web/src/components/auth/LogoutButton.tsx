'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { outletAuthService } from '@/features/auth/services/auth.service';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await outletAuthService.logout();
    } finally {
      // always redirect after logout
      router.replace('/auth/login');
    }
  };

  return (
    <motion.button
      onClick={handleLogout}
      whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}
      whileTap={{ scale: 0.98 }}
      style={styles.logoutBtn}
    >
      <div style={styles.iconWrapper}>
        <LogOut size={20} />
      </div>
      <span style={styles.btnText}>Logout Session</span>
    </motion.button>
  );
}

// --- Professional Sidebar Integration Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
};