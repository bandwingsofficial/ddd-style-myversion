"use client";

import { useState, useMemo, useEffect } from "react";
import { OutletProduct } from "../types";
import { outletService } from "../services/outletService";
import { ImageOff, RefreshCw } from "lucide-react";

const BACKEND_URL = "https://api.dev.local:4000";

interface Props {
  initialProducts: OutletProduct[];
}

export default function ProductList({ initialProducts }: Props) {
  // Sync internal state with props when filters change
  const [products, setProducts] = useState<OutletProduct[]>(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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
      <div style={styles.header}>
        <h3 style={styles.title}>Inventory List</h3>
        <div style={styles.badgeCount}>{products.length} Products Found</div>
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
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.emptyState}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
      style={{ ...styles.row, backgroundColor: isHovered ? '#f8fafc' : 'white' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.imgBox}>
          {imageUrl ? (
            <img src={imageUrl} alt={name} style={styles.img} />
          ) : (
            <ImageOff size={16} color="#cbd5e1" />
          )}
        </div>
      </td>
      <td style={styles.td}><div style={styles.name}>{name}</div></td>
      <td style={styles.td}>{priceDisplay}</td>
      <td style={styles.td}>
        <div style={{
          ...styles.statusPill,
          backgroundColor: item.isAvailable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          color: item.isAvailable ? '#15803d' : '#475569',
        }}>
          <span style={{ ...styles.statusDot, backgroundColor: item.isAvailable ? '#16a34a' : '#64748b' }} />
          {item.isAvailable ? 'Active' : 'Hidden'}
        </div>
      </td>
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
            backgroundColor: item.isAvailable ? '#059669' : '#e2e8f0',
          }}>
            <span style={{
              ...styles.sliderButton,
              transform: item.isAvailable ? 'translateX(18px)' : 'translateX(2px)',
            }} >
              {loadingId === item.productId && <RefreshCw size={10} className="animate-spin" />}
            </span>
          </span>
        </label>
      </td>
    </tr>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' },
  header: { padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' },
  title: { margin: 0, fontSize: '16px', fontWeight: '600' },
  badgeCount: { fontSize: '12px', color: '#64748b' },
  tableWrapper: { width: '100%', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' },
  row: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
  td: { padding: '12px 24px', verticalAlign: 'middle' },
  imgBox: { width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  name: { fontSize: '14px', fontWeight: '600' },
  priceDiscount: { fontWeight: 700, fontSize: '14px' },
  priceOriginal: { fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8' },
  priceRegular: { fontWeight: 600 },
  statusPill: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', gap: '6px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%' },
  switch: { position: 'relative', display: 'inline-block', width: '40px', height: '22px' },
  checkbox: { opacity: 0, width: 0, height: 0 },
  slider: { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '24px', transition: '0.3s' },
  sliderButton: { position: 'absolute', height: '18px', width: '18px', left: '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#94a3b8' }
};