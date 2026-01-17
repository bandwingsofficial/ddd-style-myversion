'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, CheckCircle, XCircle } from 'lucide-react';
import { StockItem } from '@/features/stock-items/stockItems.types';
import { StockItemsAPI } from '@/features/stock-items/stockItems.api';

interface Props {
  data: StockItem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function StockItemsTable({ data, loading, onRefresh }: Props) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ITEM DETAILS</th>
            <th style={styles.th}>UNIT</th>
            <th style={styles.th}>STATUS</th>
            <th style={styles.th}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {data.map((item) => {
              const isActive = item.status === 'ACTIVE';
              return (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={item.id} 
                  style={{ 
                    ...styles.tr, 
                    backgroundColor: isActive ? "white" : "#F8FAFC" 
                  }}
                >
                  <td style={styles.td}>
                    <div style={styles.nameGroup}>
                      <div style={styles.iconCircle}><Box size={16} color="#10b981"/></div>
                      <div>
                        <div style={styles.nameText}>{item.name}</div>
                        <div style={styles.idText}>ID: {item.id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.unitBadge}>{item.unit}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ 
                      ...styles.statusBadge, 
                      backgroundColor: isActive ? "#DCFCE7" : "#F1F5F9", 
                      color: isActive ? "#166534" : "#64748B" 
                    }}>
                      <div style={{...styles.dot, backgroundColor: isActive ? "#22C55E" : "#94A3B8"}} />
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {isActive ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.disableBtn} 
                        onClick={async () => { await StockItemsAPI.disable(item.id); onRefresh(); }}
                      >
                        DISABLE
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.activateBtn} 
                        onClick={async () => { await StockItemsAPI.enable(item.id); onRefresh(); }}
                      >
                        ACTIVATE
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "16px 24px", backgroundColor: "#f1f5f9", color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" },
  td: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  tr: { transition: "background-color 0.2s" },
  nameGroup: { display: "flex", alignItems: "center", gap: "12px" },
  iconCircle: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" },
  nameText: { fontWeight: 700, color: "#1e293b", fontSize: "15px" },
  idText: { color: "#94a3b8", fontSize: "11px", marginTop: "2px" },
  unitBadge: { backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, color: "#475569" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },
  dot: { width: "8px", height: "8px", borderRadius: "50%" },
  activateBtn: { backgroundColor: "#10B981", color: "white", border: "none", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)", letterSpacing: "0.5px" },
  disableBtn: { backgroundColor: "#fff", color: "#EF4444", border: "1px solid #FEE2E2", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }
};