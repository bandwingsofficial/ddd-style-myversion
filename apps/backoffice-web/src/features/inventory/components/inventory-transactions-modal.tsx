"use client";

import React, { useEffect, useState } from "react";
import { InventoryAPI } from "../api/inventory.api";
import { InventoryItem, InventoryTransaction } from "../types/inventory.types";
import { X, History, ArrowUpRight, ArrowDownLeft, Minus, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

export default function InventoryTransactionsModal({ item, onClose }: Props) {
  const [logs, setLogs] = useState<InventoryTransaction[]>([]);

  useEffect(() => {
    InventoryAPI.getTransactions(item.stockItemId).then((res) => {
      setLogs(res.data.data);
    });
  }, [item.stockItemId]);

  // Helper to render specific icons and colors based on type
  const getLogDetails = (type: string) => {
    if (type.includes('ADD')) return { icon: <ArrowUpRight size={18} />, color: "#10b981", bg: "#ecfdf5" };
    if (type.includes('TRANSFER')) return { icon: <ArrowRightLeft size={18} />, color: "#f59e0b", bg: "#fffbeb" };
    if (type.includes('ADJUST')) return { icon: <Minus size={18} />, color: "#3b82f6", bg: "#eff6ff" };
    return { icon: <ArrowDownLeft size={18} />, color: "#ef4444", bg: "#fef2f2" };
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div 
        initial={{ x: "100%", opacity: 0.5 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={styles.drawer} 
        onClick={e => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.historyIconBox}>
              <History size={22} color="#10b981" />
            </div>
            <div>
              <h2 style={styles.title}>Transaction History</h2>
              <p style={styles.subtitle}>{item.stockItemId}</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
        </div>

        <div style={styles.logList}>
          {logs.length === 0 ? (
            <div style={styles.emptyState}>No transactions found for this item.</div>
          ) : (
            logs.map((log) => {
              const details = getLogDetails(log.type);
              return (
                <div key={log.id} style={styles.logItem}>
                  <div style={{ ...styles.logIcon, backgroundColor: details.bg, color: details.color }}>
                    {details.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.logType}>{log.type}</div>
                    <div style={styles.logDate}>
                       {new Date(log.createdAt).toLocaleDateString()} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ ...styles.logQty, color: details.color }}>
                    {log.type.includes('ADD') ? '+' : '-'}{log.quantity.value} <span style={styles.unitText}>{item.unit}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1000 },
  drawer: { backgroundColor: '#fff', width: '480px', height: '100%', padding: '32px', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' },
  historyIconBox: { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { color: '#94a3b8', fontSize: '12px', margin: '2px 0 0 0', fontFamily: 'monospace' },
  closeBtn: { background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  logList: { display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '4px' },
  logItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#fff', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  logIcon: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logType: { fontWeight: 700, fontSize: '14px', color: '#334155', letterSpacing: '0.3px' },
  logDate: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  logQty: { fontWeight: 800, fontSize: '16px', textAlign: 'right' },
  unitText: { fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginLeft: '2px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }
};