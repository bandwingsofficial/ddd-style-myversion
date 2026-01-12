'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Settings, 
  LogOut, 
  Box 
} from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
   
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Branding Section */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>
          <Box size={24} color="#fff" />
        </div>
        <span style={styles.logoText}>ADMIN.IO</span>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  ...styles.navItem,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                }}
              >
                <div style={{ color: isActive ? '#10b981' : 'inherit' }}>
                  {item.icon}
                </div>
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.name}</span>
                {isActive && (
                  <motion.div layoutId="activePill" style={styles.activePill} />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout (Bottom) */}
      <div style={styles.footer}>
        <LogoutButton />
      </div>
    </aside>
  );
}

// --- Professional High-End Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '280px',
    height: '100vh',
    backgroundColor: '#064e3b', // Deep emerald background
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
  },
  logoSection: {
    padding: '32px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#10b981', // Emerald brand color
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '1px',
    color: '#fff',
  },
  nav: {
    flex: 1,
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    position: 'relative',
    cursor: 'pointer',
  },
  activePill: {
    position: 'absolute',
    left: '-16px',
    width: '4px',
    height: '24px',
    backgroundColor: '#10b981',
    borderRadius: '0 4px 4px 0',
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
};