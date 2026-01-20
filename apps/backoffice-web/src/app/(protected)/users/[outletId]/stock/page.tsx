'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Loader2, Scale, Tag, Store } from 'lucide-react';
import { UsersService } from '@/features/users/users.service';
import { axiosInstance } from '@/http/axios';

interface StockItem {
  id: string;
  stockItemId: string;
  unit: string;
  quantity: {
    value: number;
  };
  updatedAt: string;
}

interface MasterStockItem {
  id: string;
  name: string;
}

export default function OutletStockPage() {
  const router = useRouter();
  const params = useParams();
  const outletId = params?.outletId as string;

  const [stock, setStock] = useState<StockItem[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [outletName, setOutletName] = useState(''); // NEW: Store outlet name
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (outletId) {
      loadData();
    }
  }, [outletId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch Outlet Stock
      const stockPromise = UsersService.getOutletStock(outletId);
      
      // 2. Fetch Master Stock Items (for mapping IDs to Names)
      const masterListPromise = axiosInstance.get('/stock-items'); 

      // 3. NEW: Fetch Outlet Details (to get the name for the header)
      // Assuming standard REST pattern: /outlets/:id
      const outletPromise = axiosInstance.get(`/outlets/${outletId}`);

      const [stockRes, masterRes, outletRes] = await Promise.all([
        stockPromise, 
        masterListPromise,
        outletPromise
      ]);

      // --- Process Stock Data ---
      const stockData = stockRes.data.data || [];
      setStock(stockData);

      // --- Process Master List & Create Map ---
      const masterItems: MasterStockItem[] = masterRes.data.data || [];
      const nameMap: Record<string, string> = {};
      masterItems.forEach(item => {
        nameMap[item.id] = item.name;
      });
      setItemNames(nameMap);

      // --- Process Outlet Name ---
      const outletData = outletRes.data.data || outletRes.data;
      setOutletName(outletData.name || 'Unknown Outlet');

    } catch (err: any) {
      console.error("Data fetch error:", err);
      const errMsg = err.response?.data?.message || 'Failed to load data.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get name from ID
  const getItemName = (id: string) => {
    return itemNames[id] || id; // Show ID if name not found, acts as fallback
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button 
          onClick={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div style={styles.headerContent}>
          <div style={styles.iconCircle}>
            <Store size={24} color="#3b82f6" />
          </div>
          <div>
            {/* UPDATED: Shows Real Outlet Name */}
            <h1 style={styles.title}>
              {loading ? 'Loading...' : outletName}
            </h1>
            <p style={styles.subtitle}>
              Stock Inventory Management
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading && (
          <div style={styles.centerState}>
            <Loader2 size={40} color="#3b82f6" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 16, color: '#64748b' }}>Loading inventory...</p>
          </div>
        )}

        {!loading && error && (
          <div style={styles.errorState}>
            <p style={{ marginBottom: 12 }}>{error}</p>
            <button onClick={loadData} style={styles.retryButton}>Retry</button>
          </div>
        )}

        {!loading && !error && stock.length === 0 && (
          <div style={styles.centerState}>
            <Package size={48} color="#cbd5e1" />
            <p style={{ marginTop: 16, color: '#64748b' }}>No stock items found for {outletName}.</p>
          </div>
        )}

        {!loading && !error && stock.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Stock Name</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Available</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={styles.tableRow}
                  >
                    {/* 1. Mapped Name */}
                    <td style={styles.td}>
                      <div style={styles.itemName}>
                        {getItemName(item.stockItemId)}
                      </div>
                    </td>

                    {/* 2. Unit */}
                    <td style={styles.td}>
                       <div style={styles.unitBadge}>
                          <Tag size={13} />
                          <span>{item.unit}</span>
                       </div>
                    </td>

                    {/* 3. Available Quantity */}
                    <td style={styles.td}>
                      <div style={styles.qtyBadge}>
                        <Scale size={14} />
                        <span>{item.quantity?.value ?? item.quantity}</span>
                      </div>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  header: { marginBottom: '32px' },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
    padding: 0,
  },
  headerContent: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #dbeafe',
  },
  title: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' },
  content: {
    backgroundColor: 'white',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    minHeight: '400px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#ef4444',
  },
  retryButton: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#334155',
    fontWeight: 500
  },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '16px 24px', verticalAlign: 'middle' },
  itemName: { fontSize: '15px', fontWeight: 600, color: '#334155' },
  qtyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#ecfdf5', // Light green
    color: '#059669',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 700,
  },
  unitBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
};