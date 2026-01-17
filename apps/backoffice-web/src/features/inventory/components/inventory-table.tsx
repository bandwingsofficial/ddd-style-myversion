"use client";

import { useInventory } from "../hooks/use-inventory";
import InventoryRowActions from "./inventory-row-actions";
import { RefreshCw, Layers, SearchX } from "lucide-react";

interface InventoryTableProps {
  searchQuery?: string;
}

export default function InventoryTable({ searchQuery = "" }: InventoryTableProps) {
  const { inventory, loading, refresh } = useInventory();

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((item: any) =>
    item.stockName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stockItemId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={32} color="#10b981" className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 500 }}>Syncing Inventory Levels...</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>STOCK ITEM</th>
            <th style={styles.th}>UNIT</th>
            <th style={styles.th}>AVAILABLE</th>
            <th style={styles.th}>TOTAL</th>
            <th style={styles.th}>STATUS</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((item) => {
            const isLow = item.availableQty.value < 10;
            const isActive = item.status === "ACTIVE";

            return (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.itemCell}>
                    <div style={styles.iconBox}><Layers size={14} color="#10b981"/></div>
                    <span style={styles.itemName}>{item.stockName}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.unitBadge}>{item.unit}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ color: isLow ? '#ef4444' : '#1e293b', fontWeight: 700 }}>
                    {item.availableQty.value}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ color: '#64748b', fontWeight: 600 }}>{item.totalQty.value}</div>
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
                  <InventoryRowActions item={item} onActionComplete={refresh} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty Search Results Display */}
      {filteredInventory.length === 0 && (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
          <SearchX size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '15px', fontWeight: 500 }}>No items found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "16px 24px", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" },
  td: { padding: "18px 24px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  tr: { transition: "background 0.2s" },
  itemCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  iconBox: { width: '28px', height: '28px', backgroundColor: '#ecfdf5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontWeight: 700, color: '#1e293b', fontSize: '14px' },
  unitBadge: { backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: "#475569" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
};