"use client";

import { useEffect, useState } from "react";
import { ProductsAPI } from "../services/products.api";
import { Product } from "../types/product.types";
import { X, Info, Calendar, Tag, TrendingUp, Package, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetailModal({ productId, onClose }: { productId: string, onClose: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductsAPI.fetchById(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || !product) return null;

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={detailStyles.overlay} onClick={onClose}>
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={detailStyles.modal} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={detailStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={detailStyles.iconCircle}><Package size={18} color="#10b981" /></div>
            <h2 style={detailStyles.title}>Full Product Insights</h2>
          </div>
          <button onClick={onClose} style={detailStyles.closeBtn}><X size={20}/></button>
        </div>
        
        <div style={detailStyles.scrollArea}>
          {/* Main Hero Section */}
          <div style={detailStyles.heroSection}>
            <img 
              src={product.images.mainImage} 
              style={detailStyles.mainImg} 
              alt={product.name.value} 
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={detailStyles.productName}>{product.name.value}</h1>
                {product.trendState.trending && (
                  <span style={detailStyles.trendingBadge}>
                    <TrendingUp size={12} /> TRENDING
                  </span>
                )}
              </div>
              <p style={detailStyles.slugText}>Slug: {product.slug.value}</p>
              
              {/* Replace the priceContainer div with this code */}
<div style={detailStyles.priceContainer}>
  <span style={detailStyles.finalPrice}>
    {/* Use ?? 0 to handle undefined cases safely */}
    ₹{product.price.originalPrice - (product.price.discountPrice ?? 0)}
  </span>
  
  {/* Check if discountPrice exists and is greater than 0 */}
  {(product.price.discountPrice ?? 0) > 0 && (
    <>
      <span style={detailStyles.originalPrice}>₹{product.price.originalPrice}</span>
      <span style={detailStyles.discountLabel}>Save ₹{product.price.discountPrice}</span>
    </>
  )}
</div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div style={detailStyles.infoGrid}>
            <div style={detailStyles.infoCard}>
              <h4 style={detailStyles.sectionTitle}><Info size={16}/> Short Summary</h4>
              <p style={detailStyles.shortDesc}>{product.shortDescription}</p>
            </div>

            <div style={detailStyles.infoCard}>
              <h4 style={detailStyles.sectionTitle}><Tag size={16}/> Metadata</h4>
              <div style={detailStyles.metaItem}>
                <Package size={14} /> <span>Stock ID: {product.stockItemId}</span>
              </div>
              <div style={detailStyles.metaItem}>
                <Clock size={14} /> <span>Status: <strong>{product.status}</strong></span>
              </div>
            </div>
          </div>

          {/* Long Description */}
          <div style={detailStyles.infoCard}>
            <h4 style={detailStyles.sectionTitle}><Info size={16}/> Full Description</h4>
            <p style={detailStyles.longDesc}>{product.longDescription}</p>
          </div>

          {/* Gallery Section */}
          {product.images.galleryImages.length > 0 && (
            <div style={{ marginTop: '20px' }}>
               <h4 style={detailStyles.sectionTitle}>Product Gallery</h4>
               <div style={detailStyles.gallery}>
                  {product.images.galleryImages.map((img, i) => (
                      <img key={i} src={img} style={detailStyles.galleryImg} alt="Gallery" />
                  ))}
               </div>
            </div>
          )}

          {/* Time Logs */}
          <div style={detailStyles.footerLogs}>
            <div style={detailStyles.logItem}>
              <Calendar size={12} /> Created: {formatDate(product.createdAt)}
            </div>
            <div style={detailStyles.logItem}>
              <Calendar size={12} /> Last Updated: {formatDate(product.updatedAt)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const detailStyles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 },
  modal: { backgroundColor: "#fff", width: "600px", maxHeight: "85vh", borderRadius: "24px", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" },
  header: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  scrollArea: { padding: '24px', overflowY: 'auto' },
  title: { fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 },
  iconCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' },
  
  heroSection: { display: 'flex', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px dashed #e2e8f0' },
  mainImg: { width: '150px', height: '150px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #f1f5f9' },
  productName: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' },
  slugText: { fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' },
  
  trendingBadge: { backgroundColor: '#fffbeb', color: '#f59e0b', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #fef3c7' },
  
  priceContainer: { display: 'flex', alignItems: 'baseline', gap: '10px' },
  finalPrice: { fontSize: '24px', fontWeight: 800, color: '#10b981' },
  originalPrice: { fontSize: '16px', textDecoration: 'line-through', color: '#94a3b8' },
  discountLabel: { fontSize: '12px', color: '#ef4444', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 },

  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  infoCard: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '16px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  
  shortDesc: { fontSize: '14px', lineHeight: '1.5', color: '#475569', margin: 0 },
  longDesc: { fontSize: '14px', lineHeight: '1.7', color: '#1e293b', margin: 0 },
  
  metaItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginTop: '6px' },
  
  gallery: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  galleryImg: { width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' },
  
  footerLogs: { marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' },
  logItem: { fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }
};