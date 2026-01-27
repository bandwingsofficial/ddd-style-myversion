"use client";

import { useState } from "react";
import { OutletProduct } from "../types";
import { outletService } from "../services/outletService";

interface Props {
  initialProducts: OutletProduct[];
}

export default function ProductList({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (product: OutletProduct) => {
    setLoadingId(product.productId);
    const action = product.isAvailable ? "disable" : "enable";
    
    try {
      await outletService.toggleProduct(product.productId, action);
      
      // Optimistic Update
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === product.productId ? { ...p, isAvailable: !p.isAvailable } : p
        )
      );
    } catch (error) {
      console.error("Failed to toggle product", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Outlet Menu Management</h3>
        <p style={styles.subtitle}>Control item availability for this branch</p>
      </div>
      
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Product ID</th>
              <th style={styles.th}>Status</th>
              <th style={{...styles.th, textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={styles.row}>
                <td style={styles.td}>
                  <span style={styles.code}>{product.productId}</span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: product.isAvailable ? '#dcfce7' : '#f3f4f6',
                    color: product.isAvailable ? '#166534' : '#4b5563',
                  }}>
                    {product.isAvailable ? 'In Stock' : 'Unavailable'}
                  </span>
                </td>
                <td style={{...styles.td, textAlign: 'right'}}>
                  <input 
                    type="checkbox"
                    checked={product.isAvailable}
                    disabled={loadingId === product.productId}
                    onChange={() => handleToggle(product)}
                    style={styles.checkbox}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: 'white',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  theadRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  th: {
    padding: '16px 24px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#16a34a',
  }
};