'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, RefreshCw, Box, AlertCircle } from "lucide-react";
import { StockItemsAPI } from '@/features/stock-items/stockItems.api';
import { StockItem } from '@/features/stock-items/stockItems.types';
import StockItemsTable from './components/StockItemsTable';
import CreateStockItemModal from './components/CreateStockItemModal';

export default function StockItemsPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await StockItemsAPI.getAll();
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  if (loading && items.length === 0) return (
    <div style={styles.loaderContainer}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw size={40} color="#10b981" />
      </motion.div>
      <p style={{ marginTop: 12, color: "#64748b", fontWeight: 500 }}>Syncing Inventory...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.iconCircleHeader}><Box size={24} color="#10b981"/></div>
          <div>
            <h1 style={styles.title}>Stock Items</h1>
            <p style={styles.subtitle}>Super Admin Control Panel | Manage raw materials</p>
          </div>
        </div>
        
        <div style={styles.headerActions}>
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input 
              placeholder="Search items..." 
              style={styles.searchInput} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={styles.greenPopButton} 
            onClick={() => setOpenCreate(true)}
          >
            <Plus size={20} /> Create Stock Item
          </motion.button>
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.tableCard}>
        <div style={styles.tableHeaderSection}>
          <h3 style={styles.tableTitle}>Inventory List</h3>
          <button onClick={fetchItems} style={styles.refreshBtn}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div style={styles.tableBodyWrapper}>
          <StockItemsTable
            data={filteredItems}
            loading={loading}
            onRefresh={fetchItems}
          />
        </div>
      </motion.div>

      <CreateStockItemModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchItems}
      />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "10px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
  headerTitleGroup: { display: "flex", alignItems: "center", gap: "16px" },
  iconCircleHeader: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: "28px", fontWeight: 800, color: "#1e293b", margin: 0 },
  subtitle: { color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" },
  headerActions: { display: "flex", gap: "16px", alignItems: "center" },
  searchBox: { display: "flex", alignItems: "center", backgroundColor: "#fff", padding: "0 16px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "280px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  searchInput: { border: "none", padding: "12px", outline: "none", width: "100%", fontSize: "14px", backgroundColor: "transparent" },
  greenPopButton: { background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" },
  tableCard: { backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", overflow: "hidden" },
  tableHeaderSection: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  tableTitle: { fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 },
  refreshBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  tableBodyWrapper: { padding: '0' },
  loaderContainer: { height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }
};