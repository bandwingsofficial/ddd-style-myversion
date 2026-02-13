'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Menu, 
  Store, 
  ChevronDown, 
  LogOut, 
  User, 
} from 'lucide-react';

import { outletAuthService } from '@/features/auth/services/auth.service';
import { outletService } from '@/features/outlet/services/outletService';
import { useOutletProfile } from '@/features/outlet/hooks/useOutletProfile';
import { Outlet } from '@/features/outlet/types';

// Define the backend URL to match your Profile Page logic
const BACKEND_URL = 'https://api.dev.local:4000';

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /* ---------------- Outlet State ---------------- */
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loadingOutlet, setLoadingOutlet] = useState(true);

  /* ---------------- Fetch Outlet ---------------- */
  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const outletData = await outletService.getOutlet();
        setOutlet(outletData);
      } catch (error) {
        console.error('Failed to load outlet for header', error);
        setOutlet(null);
      } finally {
        setLoadingOutlet(false);
      }
    };

    fetchOutlet();
  }, []);

  /* ---------------- Fetch Profile Data ---------------- */
  const { profile, loading: loadingProfile } = useOutletProfile(outlet?.id ?? '');

  const handleLogout = async () => {
    try {
      await outletAuthService.logout();
    } finally {
      router.replace('/auth/login');
    }
  };

  /**
   * Helper to format image URLs correctly (Sync with Profile Page)
   */
  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${BACKEND_URL}/${path}`;
  };

  // Determine display name: Priority Profile Owner Name > Outlet Name > Default
  const displayName = profile?.ownerName || outlet?.name || 'Outlet Admin';
  const displayEmail = profile?.contactEmail || 'admin@caneandtender.com';
  const avatarLetter = (profile?.ownerName || outlet?.name || 'O').charAt(0).toUpperCase();
  
  // Use avatarUrl from backend profile
  const avatarImage = getImageUrl(profile?.avatarUrl);

  return (
    <header style={styles.header}>
      {/* Left Section */}
      <div style={styles.left}>
        <button style={styles.menuButton}>
          <Menu size={20} color="#64748b" />
        </button>

        <div style={styles.searchContainer}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Quick Search..." 
            style={styles.searchInput} 
          />
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.right}>
        {/* Outlet Name Widget */}
        <div style={styles.outletWidget}>
          <Store size={16} />
          <span style={{ minWidth: '180px', textAlign: 'center' }}>
            {loadingOutlet
              ? 'Loading outlet...'
              : outlet?.name ?? 'Outlet not found'}
          </span>
        </div>

        {/* Notification Bell */}
        <div style={styles.iconButton}>
          <Bell size={20} color="#64748b" />
          <span style={styles.notificationDot}></span>
        </div>

        {/* Profile Dropdown */}
        <div 
          style={styles.profileWrapper}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div style={styles.userInfoTrigger}>
            <div style={styles.userDetails}>
              <span style={styles.role}>{loadingProfile ? '...' : displayName}</span>
            </div>
            <div style={styles.avatar}>
              {avatarImage ? (
                <img 
                  src={avatarImage} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                />
              ) : (
                avatarLetter
              )}
            </div>
            <ChevronDown size={16} color="#64748b" />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                style={styles.dropdown}
              >
                <div style={styles.dropdownHeader}>
                  <p style={styles.dropdownName}>
                    {displayName}
                  </p>
                  <p style={styles.dropdownEmail}>
                    {displayEmail}
                  </p>
                </div>

                <ul style={styles.dropdownList}>
                  <li
                    style={styles.dropdownItem}
                    onClick={() => router.push('/profile')}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </li>
                </ul>

                <div style={styles.dropdownFooter}>
                  <button 
                    onClick={handleLogout} 
                    style={styles.dropdownLogoutBtn}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Styles ---------------- */

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    height: '72px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    width: '320px',
    gap: '10px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: '#334155',
    width: '100%',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  outletWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfeff',
    color: '#0369a1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  iconButton: {
    position: 'relative',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },
  profileWrapper: {
    position: 'relative',
    paddingLeft: '16px',
    borderLeft: '1px solid #e2e8f0',
  },
  userInfoTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  userDetails: {
    textAlign: 'right',
  },
  role: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
  },
  avatar: {
    height: '40px',
    width: '40px',
    borderRadius: '12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '18px',
    overflow: 'hidden',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    zIndex: 50,
  },
  dropdownHeader: {
    padding: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  dropdownName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '4px',
  },
  dropdownEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  dropdownList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#475569',
    transition: 'background 0.2s',
  },
  dropdownFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '8px',
  },
  dropdownLogoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};