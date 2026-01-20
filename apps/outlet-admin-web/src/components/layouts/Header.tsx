'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Menu, 
  Calendar, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings, 
  ShoppingBag 
} from 'lucide-react';
import { outletAuthService } from '@/features/auth/services/auth.service';

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 1. State for Live Date
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // 2. Effect to set date on client load (updates every minute to stay accurate)
  useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute to catch midnight changes

    return () => clearInterval(timer);
  }, []);

  // 3. Format Date Function (Date ONLY, no time)
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleLogout = async () => {
    try {
      await outletAuthService.logout();
    } finally {
      router.replace('/auth/login');
    }
  };

  return (
    <header style={styles.header}>
      {/* Left Section: Menu Toggle + Search */}
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

      {/* Right Section: Date, Bell, Profile (with Dropdown) */}
      <div style={styles.right}>
        {/* Live Date Widget (Date Only) */}
        <div style={styles.dateWidget}>
          <Calendar size={16} />
          {/* Min-width ensures no layout shift */}
          <span style={{ minWidth: '180px', textAlign: 'center' }}>
            {currentDate ? formatDate(currentDate) : 'Loading...'}
          </span>
        </div>

        {/* Notification Bell */}
        <div style={styles.iconButton}>
          <Bell size={20} color="#64748b" />
          <span style={styles.notificationDot}></span>
        </div>

        {/* User Profile Wrapper - Handles Hover */}
        <div 
          style={styles.profileWrapper}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div style={styles.userInfoTrigger}>
            <div style={styles.userDetails}>
              <span style={styles.role}>Outlet Admin</span>
            </div>
            <div style={styles.avatar}>S</div>
            <ChevronDown size={16} color="#64748b" style={{ marginLeft: '4px' }} />
          </div>

          {/* Dropdown Menu */}
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
                  <p style={styles.dropdownName}>Outler Admin</p>
                  <p style={styles.dropdownEmail}>admin@caneandtender.com</p>
                </div>

                <ul style={styles.dropdownList}>
                  <li style={styles.dropdownItem}>
                    <User size={16} />
                    <span>Profile</span>
                  </li>
                  <li style={styles.dropdownItem}>
                    <ShoppingBag size={16} />
                    <span>My Orders</span>
                  </li>
                  <li style={styles.dropdownItem}>
                    <Settings size={16} />
                    <span>Settings</span>
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
    display: 'flex',
    alignItems: 'center',
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
  commandKey: {
    fontSize: '12px',
    color: '#94a3b8',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '2px 6px',
    backgroundColor: '#ffffff',
    fontWeight: 500,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  dateWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  iconButton: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
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
    padding: '8px 0',
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    margin: '0 0 4px 0',
  },
  dropdownEmail: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  dropdownList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#334155',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: 500,
  },
  dropdownFooter: {
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
  },
  dropdownLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
};