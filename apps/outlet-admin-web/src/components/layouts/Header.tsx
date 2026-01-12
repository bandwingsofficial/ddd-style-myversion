'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronDown, LayoutDashboard, Store, Users, Settings } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Define searchable navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
  ];

  const filteredResults = navItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) && query !== ''
  );

  // Handle clicking outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={styles.header}>
      {/* Dynamic Search Section */}
      <div style={styles.leftSection} ref={searchRef}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search pages (e.g. Users...)" 
            style={styles.searchInput}
            value={query}
            onFocus={() => setShowResults(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
          />
        </div>

        {/* Floating Search Results */}
        <AnimatePresence>
          {showResults && filteredResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={styles.searchResults}
            >
              {filteredResults.map((item) => (
                <div 
                  key={item.href} 
                  style={styles.resultItem}
                  onClick={() => {
                    router.push(item.href);
                    setQuery('');
                    setShowResults(false);
                  }}
                >
                  <span style={styles.resultIcon}>{item.icon}</span>
                  {item.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={styles.rightSection}>
        <motion.button 
          whileHover={{ backgroundColor: '#f1f5f9' }}
          style={styles.notificationBtn}
        >
          <Bell size={20} color="#64748b" />
          <div style={styles.notifDot} />
        </motion.button>

        <div style={styles.userProfile}>
          <div style={styles.textDetails}>
            <span style={styles.userName}>Outlet Admin</span>
            <span style={styles.userRole}></span>
          </div>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>A</div>
            <div style={styles.statusDot} />
          </div>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>
    </header>
  );
}

// --- Professional High-End Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  header: {
    height: '72px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'relative',
    zIndex: 100,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    width: '320px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    marginLeft: '10px',
    fontSize: '14px',
    color: '#1e293b',
    width: '100%',
  },
  searchResults: {
    position: 'absolute',
    top: '56px',
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    overflow: 'hidden',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    cursor: 'pointer',
    transition: 'background 0.2s',
    backgroundColor: '#fff',
  },
  resultIcon: {
    color: '#10b981', // Emerald theme
    display: 'flex',
    alignItems: 'center',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  notificationBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid #fff',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  textDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
  },
  userRole: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  statusDot: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '12px',
    height: '12px',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    border: '2px solid #fff',
  },
};