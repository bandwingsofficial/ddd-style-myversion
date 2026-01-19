'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, MapPin, Loader2, Info, Store, Package } from 'lucide-react';
import { useOutletStore } from '@/features/outlets/outlet.store';

// --- Simple Toast Component ---
const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        style={styles.toast}
      >
        <Info size={16} />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function UsersOutletSelectPage() {
  const router = useRouter();
  const { outlets, fetchOutlets, loading } = useOutletStore();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2500);
  };

  const filteredOutlets = useMemo(() => {
    return outlets.filter((o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.branch && o.branch.toLowerCase().includes(search.toLowerCase()))
    );
  }, [outlets, search]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 size={40} color="#10b981" />
        </motion.div>
        <p style={{ marginTop: 12, color: "#64748b", fontWeight: 500 }}>Loading Directory...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Toast message={toast.msg} visible={toast.show} />

      <header style={styles.header}>
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 style={styles.title}>Staff Directory</h1>
          <p style={styles.subtitle}>Select an outlet to manage users or view stock</p>
        </motion.div>
      </header>

      {/* Search Section */}
      <div style={styles.searchWrapper}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by name or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* List Section */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.grid}
      >
        <AnimatePresence mode='popLayout'>
          {filteredOutlets.map((o) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -2 }}
              style={styles.card}
            >
              <div style={styles.cardInfo}>
                <div style={styles.iconCircle}>
                  <Store size={18} color="#10b981"/>
                </div>
                <div>
                  <span style={styles.outletName}>{o.name}</span>
                  <div style={styles.locationWrapper}>
                    <MapPin size={12} />
                    <span>{o.branch ?? 'Main Branch'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* NEW STOCK BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Navigate to the new stock page
                    router.push(`/users/${o.id}/stock`); 
                  }}
                  style={{...styles.gradientButton, background: '#334155', boxShadow: 'none'}}
                  title="View Stock"
                >
                  <Package size={16} />
                  Stock
                </motion.button>

                {/* MANAGE BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    showToast(`Loading ${o.name}...`);
                    router.push(`/users/${o.id}`);
                  }}
                  style={styles.gradientButton}
                >
                  Manage
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOutlets.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.noResults}>
            No outlets match your search.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px', // Slightly wider to fit 2 buttons
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: { marginBottom: '32px' },
  title: { fontSize: '32px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em', marginBottom: '4px' },
  subtitle: { fontSize: '15px', color: '#64748b', fontWeight: 500 },
  searchWrapper: { marginBottom: '24px' },
  searchBox: { display: "flex", alignItems: "center", backgroundColor: "#fff", padding: "0 16px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s ease" },
  searchInput: { width: '100%', padding: '14px', fontSize: '15px', border: "none", outline: 'none', backgroundColor: 'transparent', color: "#1e293b" },
  grid: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' },
  cardInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconCircle: { width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" },
  outletName: { fontSize: '17px', fontWeight: 700, color: "#1e293b" },
  locationWrapper: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#94a3b8', marginTop: "2px" },
  gradientButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#fff', background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', textTransform: "uppercase", letterSpacing: "0.5px" },
  toast: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e293b', color: '#fff', padding: '12px 24px', borderRadius: '50px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  loaderContainer: { display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center' },
  noResults: { textAlign: 'center', color: '#94a3b8', marginTop: '32px', fontSize: '15px', fontWeight: 500 }
};