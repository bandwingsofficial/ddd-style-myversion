"use client";

import { useState } from "react";
import InventoryTable from "@/features/inventory/components/inventory-table";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { 
  Package, 
  LayoutGrid, 
  Plus, 
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InitializeInventoryModal from "@/features/inventory/components/initialize-inventory-modal";

export default function InventoryPage() {
  const [isInitOpen, setIsInitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { refresh } = useInventory();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={styles.container}
    >
      {/* --- HEADER SECTION --- */}
      <div style={styles.header}>
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={styles.headerTitleGroup}
        >
          <div style={styles.iconCircleHeader}>
            <LayoutGrid size={20} color="#10b981" />
          </div>
          <div>
            <h1 style={styles.title}>Inventory</h1>
            <p style={styles.subtitle}>Super Admin Panel</p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          whileFocus={{ scale: 1.02 }}
          style={styles.searchContainer}
        >
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <X 
                size={16} 
                color="#94a3b8" 
                style={{ cursor: 'pointer', marginRight: '12px' }} 
                onClick={() => setSearchQuery("")} 
              />
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={styles.actionBar}
        >
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 6px 15px rgba(16, 185, 129, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={styles.initButton}
            onClick={() => setIsInitOpen(true)}
          >
            <Plus size={18} />
            Initialize
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={styles.card}
      >
        <div style={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.headerIconBg}>
              <Package size={16} color="#10b981" />
            </div>
            <h3 style={styles.cardTitle}>Inventory Overview</h3>
          </div>
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={styles.badge}
          >
            Live Sync
          </motion.div>
        </div>

        <div style={styles.tableWrapper}>
          {/* ✅ SEARCH INTEGRATION: Passing searchQuery to Table */}
          <InventoryTable searchQuery={searchQuery} />
        </div>
      </motion.div>

      <AnimatePresence>
        {isInitOpen && (
          <InitializeInventoryModal 
            onClose={() => setIsInitOpen(false)} 
            onSuccess={() => {
              refresh();
              setIsInitOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "24px" },
  headerTitleGroup: { display: "flex", alignItems: "center", gap: "12px", minWidth: "180px" },
  iconCircleHeader: { width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: "30px", fontWeight: 800, color: "#1e293b", margin: 0 },
  subtitle: { color: "#64748b", margin: 0, fontSize: "13px", fontWeight: 500 },
  searchContainer: { flex: 1, maxWidth: "400px", display: "flex", alignItems: "center", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "2px 4px", transition: "all 0.2s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  searchIcon: { marginLeft: "12px" },
  searchInput: { flex: 1, border: "none", padding: "10px 12px", fontSize: "14px", outline: "none", color: "#1e293b", backgroundColor: "transparent" },
  actionBar: { display: "flex", gap: "12px" },
  initButton: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", color: "#ffffff", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" },
  card: { backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", overflow: "hidden" },
  cardHeader: { padding: "18px 24px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerIconBg: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0 },
  badge: { padding: "4px 10px", borderRadius: "20px", backgroundColor: "#f0fdf4", color: "#16a34a", fontSize: "10px", fontWeight: 700 },
  tableWrapper: { padding: "0 8px 8px 8px" }
};