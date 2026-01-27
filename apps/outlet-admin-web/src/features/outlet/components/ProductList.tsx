"use client";

import { useState, useMemo } from "react";
import { OutletProduct } from "../types";
import { outletService } from "../services/outletService";
import { ImageOff, MoreHorizontal, RefreshCw } from "lucide-react";

const BACKEND_URL = "https://api.dev.local:4000";

interface Props {
  initialProducts: OutletProduct[];
}

export default function ProductList({ initialProducts }: Props) {
  const [products, setProducts] = useState<OutletProduct[]>(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Toggle Logic
  const handleToggle = async (item: OutletProduct) => {
    setLoadingId(item.productId);
    const action = item.isAvailable ? "disable" : "enable";
    try {
      await outletService.toggleProduct(item.productId, action);
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === item.productId ? { ...p, isAvailable: !p.isAvailable } : p
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
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Outlet Menu Management</h3>
          <p style={styles.subtitle}>Control item availability for this branch</p>
        </div>
        <div style={styles.headerActions}>
           {/* Decorative elements to make it look active */}
           <div style={styles.badgeCount}>{products.length} Items</div>
        </div>
      </div>
      
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={{...styles.th, width: '80px'}}>Image</th>
              <th style={styles.th}>Product Details</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Status</th>
              <th style={{...styles.th, textAlign: 'right', paddingRight: '32px'}}>Availability</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <ProductRow 
                key={item.id} 
                item={item} 
                loadingId={loadingId} 
                onToggle={handleToggle} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ Row Component with Hover State for that "Premium" feel
function ProductRow({ item, loadingId, onToggle }: { item: OutletProduct, loadingId: string | null, onToggle: (i: OutletProduct) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const p = item.product as any; 

  const name = useMemo(() => p?.name?.value || p?.name || "Unknown", [p]);

  const imageUrl = useMemo(() => {
    if (!p) return null;
    const rawImage = p.images || p.image || p.mainImage || p.thumbnail;
    let path = "";
    if (Array.isArray(rawImage)) path = rawImage[0] || "";
    else if (typeof rawImage === "object" && rawImage !== null) path = rawImage.url || rawImage.mainImage || rawImage.value || "";
    else if (typeof rawImage === "string") path = rawImage;
    
    if (!path || path.trim() === "") return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  }, [p]);

  const priceDisplay = useMemo(() => {
    const parse = (val: any) => {
      if (val === undefined || val === null) return 0;
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };
    const original = parse(p?.originalPrice ?? p?.price?.originalPrice ?? p?.price?.value ?? p?.price);
    const discountVal = parse(p?.discountPrice ?? p?.salePrice ?? p?.price?.discountPrice ?? p?.price?.salePrice);
    
    if (discountVal > 0 && discountVal < original) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
           <span style={styles.priceDiscount}>₹{discountVal}</span>
           <span style={styles.priceOriginal}>₹{original}</span>
        </div>
      );
    }
    return <span style={styles.priceRegular}>₹{original}</span>;
  }, [p]);

  return (
    <tr 
      style={{
        ...styles.row,
        backgroundColor: isHovered ? '#f8fafc' : 'white', // Subtle hover effect
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <td style={styles.td}>
        <div style={styles.imgBox}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              style={styles.img}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
          ) : (
            <ImageOff size={16} color="#cbd5e1" />
          )}
        </div>
      </td>

      {/* Details */}
      <td style={styles.td}>
        <div style={styles.name}>{name}</div>
      </td>

      {/* Price */}
      <td style={styles.td}>
        {priceDisplay}
      </td>

      {/* Status */}
      <td style={styles.td}>
        <div style={{
          ...styles.statusPill,
          backgroundColor: item.isAvailable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          color: item.isAvailable ? '#15803d' : '#475569',
          border: item.isAvailable ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)',
        }}>
          <span style={{
            ...styles.statusDot,
            backgroundColor: item.isAvailable ? '#16a34a' : '#64748b'
          }} />
          {item.isAvailable ? 'Active' : 'Hidden'}
        </div>
      </td>

      {/* Toggle Action */}
      <td style={{...styles.td, textAlign: 'right', paddingRight: '32px'}}>
        <label style={styles.switch}>
          <input 
            type="checkbox"
            checked={item.isAvailable}
            disabled={loadingId === item.productId}
            onChange={() => onToggle(item)}
            style={styles.checkbox}
          />
          <span style={{
            ...styles.slider,
            backgroundColor: item.isAvailable ? '#059669' : '#e2e8f0', // Brand Green
            opacity: loadingId === item.productId ? 0.7 : 1,
            cursor: loadingId === item.productId ? 'wait' : 'pointer'
          }}>
            <span style={{
              ...styles.sliderButton,
              transform: item.isAvailable ? 'translateX(18px)' : 'translateX(2px)',
            }} >
               {loadingId === item.productId && (
                 <RefreshCw size={10} className="animate-spin" style={{ opacity: 0.5 }} />
               )}
            </span>
          </span>
        </label>
      </td>
    </tr>
  );
}

// 🎨 Professional Styles System
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: 'white',
    borderRadius: '16px', // Slightly more rounded
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Tailwind 'shadow-md'
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a', // Slate 900
    letterSpacing: '-0.025em',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#64748b', // Slate 500
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badgeCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
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
    backgroundColor: '#f8fafc', // Very light slate
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '14px 24px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  row: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease-in-out',
  },
  td: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  // Image Styles
  imgBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: 'white',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Text Styles
  name: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b', // Slate 800
    marginBottom: '2px',
  },
  subText: {
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  // Price Styles
  priceDiscount: {
    fontWeight: 700, 
    color: '#0f172a',
    fontSize: '14px' 
  },
  priceOriginal: { 
    fontSize: '11px', 
    textDecoration: 'line-through', 
    color: '#94a3b8',
    marginTop: '1px'
  },
  priceRegular: { 
    fontWeight: 600,
    color: '#334155' 
  },
  // Status Badge
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    gap: '6px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  // Toggle Switch
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '40px',
    height: '22px',
  },
  checkbox: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  sliderButton: {
    position: 'absolute',
    content: '""',
    height: '18px',
    width: '18px',
    left: '2px',
    bottom: '2px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Nice subtle shadow
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};