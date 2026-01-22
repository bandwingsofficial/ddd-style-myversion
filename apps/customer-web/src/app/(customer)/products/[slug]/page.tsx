"use client";

import { useParams } from "next/navigation";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import { ShoppingBag, ShieldCheck, Truck, Star, Info, Heart, Minus, Plus, Share2, Leaf } from "lucide-react";
import { useState } from "react";

// Matches Admin Port
const BACKEND_URL = "http://localhost:4000";

const getImageUrl = (data: any) => {
  if (!data) return "/placeholder.jpg"; 
  let path = "";
  if (typeof data === 'string') {
    path = data;
  } else if (typeof data === 'object') {
    path = data.mainImage || data.url || (Array.isArray(data) ? data[0] : "");
  }
  if (!path || path.trim() === "") return "/placeholder.jpg";
  if (path.startsWith("http") || path.startsWith("https")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Squeezing the details...</p>
        <style jsx>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; color: #16a34a; font-weight: 600; font-family: system-ui, sans-serif; }
          .spinner { width: 40px; height: 40px; border: 4px solid #dcfce7; border-top: 4px solid #16a34a; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Derived State
  const activeImageUrl = selectedImage || getImageUrl(product.images);
  const originalPrice = product.price?.originalPrice || 0;
  const discountPrice = product.price?.discountPrice;
  const currentPrice = (discountPrice && discountPrice < originalPrice) ? discountPrice : originalPrice;
  const isDiscounted = discountPrice && discountPrice < originalPrice;
  const savings = originalPrice - currentPrice;
  const percentageOff = Math.round((savings / originalPrice) * 100);

  return (
    <div className="page-wrapper">
      <div className="main-grid">
        
        {/* --- LEFT COLUMN: IMAGES --- */}
        <div className="gallery-section">
          <div className="main-image-frame">
             <img src={activeImageUrl} alt={product.name.value} />
             
             {/* Floating Actions */}
             <div className="top-badges">
                {product.trendState?.trending && <span className="badge trending">Trending</span>}
                {isDiscounted && <span className="badge discount">-{percentageOff}%</span>}
             </div>
             <button className="wishlist-btn"><Heart size={20} /></button>
          </div>
          
          {/* Thumbnails */}
          {product.images?.galleryImages?.length > 0 && (
            <div className="thumbnail-track">
              <button 
                className={`thumb-btn ${activeImageUrl === getImageUrl(product.images) ? 'active' : ''}`}
                onClick={() => setSelectedImage(getImageUrl(product.images))}
              >
                <img src={getImageUrl(product.images)} alt="Main" />
              </button>
              {product.images.galleryImages.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  className={`thumb-btn ${activeImageUrl === getImageUrl(img) ? 'active' : ''}`}
                  onClick={() => setSelectedImage(getImageUrl(img))}
                >
                  <img src={getImageUrl(img)} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: DETAILS --- */}
        <div className="info-section">
          
          {/* Breadcrumbs & Share */}
          <div className="info-header">
             <nav className="breadcrumbs">
               <span className="crumb-link">Home</span> / 
               <span className="crumb-link">{product.category?.name || "Product"}</span>
             </nav>
             <button className="share-btn"><Share2 size={18} /> Share</button>
          </div>
          
          <h1 className="product-title">{product.name.value}</h1>
          
          <div className="meta-stats">
            <div className="rating-block">
               <Star size={16} fill="#fbbf24" stroke="#fbbf24"/>
               <span className="score">{product.rating?.average || "4.8"}</span>
               <span className="reviews">({product.rating?.count || 12} reviews)</span>
            </div>
            <span className="dot">•</span>
            <div className="unit-block">
               <span className="unit-label">{product.unit?.value} {product.unit?.type}</span>
            </div>
          </div>

          <div className="price-container">
            <div className="current-price">₹{currentPrice}</div>
            {isDiscounted && (
               <div className="discount-info">
                  <span className="old-price">₹{originalPrice}</span>
                  <span className="save-pill">You save ₹{savings}</span>
               </div>
            )}
            <span className="tax-note">Inclusive of all taxes</span>
          </div>

          <p className="short-desc">{product.shortDescription}</p>

          <hr className="divider" />

          {/* Action Area */}
          <div className="action-row">
            <div className="qty-selector">
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18}/></button>
               <span>{quantity}</span>
               <button onClick={() => setQuantity(quantity + 1)}><Plus size={18}/></button>
            </div>
            <button className="add-to-cart-btn">
               <ShoppingBag size={20} />
               Add to Bag • ₹{currentPrice * quantity}
            </button>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
             <div className="feature-card">
                <div className="icon-box"><Leaf size={20}/></div>
                <div>
                   <h4>100% Natural</h4>
                   <p>Farm fresh ingredients</p>
                </div>
             </div>
             <div className="feature-card">
                <div className="icon-box"><Truck size={20}/></div>
                <div>
                   <h4>Fast Delivery</h4>
                   <p>Within 30 mins</p>
                </div>
             </div>
             <div className="feature-card">
                <div className="icon-box"><ShieldCheck size={20}/></div>
                <div>
                   <h4>Quality Assured</h4>
                   <p>Verified partners</p>
                </div>
             </div>
          </div>

          {/* Long Description */}
          {product.longDescription && (
            <div className="description-box">
               <h3>Product Details</h3>
               <p>{product.longDescription}</p>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        /* --- LAYOUT & BASICS --- */
        .page-wrapper {
           min-height: 100vh;
           background-color: #fff;
           padding: 120px 20px 80px 20px;
           font-family: 'Inter', system-ui, sans-serif;
           color: #0f172a;
        }
        .main-grid {
           max-width: 1100px;
           margin: 0 auto;
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 60px;
        }

        /* --- GALLERY SECTION --- */
        .gallery-section {
           position: sticky;
           top: 100px;
           align-self: start;
        }
        .main-image-frame {
           position: relative;
           width: 100%;
           aspect-ratio: 1/1;
           background: #f8fafc;
           border-radius: 24px;
           overflow: hidden;
           border: 1px solid #f1f5f9;
        }
        .main-image-frame img {
           width: 100%;
           height: 100%;
           object-fit: contain; /* Changed to contain so juice bottles don't get cropped */
           padding: 20px;
        }
        .top-badges {
           position: absolute;
           top: 16px;
           left: 16px;
           display: flex;
           gap: 8px;
        }
        .badge {
           padding: 6px 12px;
           border-radius: 100px;
           font-size: 12px;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 0.05em;
        }
        .badge.trending { background: #10b981; color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
        .badge.discount { background: #ef4444; color: white; }
        
        .wishlist-btn {
           position: absolute;
           top: 16px;
           right: 16px;
           width: 40px;
           height: 40px;
           border-radius: 50%;
           background: white;
           border: 1px solid #e2e8f0;
           display: flex;
           align-items: center;
           justify-content: center;
           cursor: pointer;
           transition: 0.2s;
           color: #64748b;
        }
        .wishlist-btn:hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; transform: scale(1.05); }

        .thumbnail-track {
           display: flex;
           gap: 12px;
           margin-top: 16px;
           overflow-x: auto;
           padding-bottom: 4px;
        }
        .thumb-btn {
           width: 70px;
           height: 70px;
           border-radius: 14px;
           border: 2px solid transparent;
           overflow: hidden;
           cursor: pointer;
           background: #f8fafc;
           padding: 0;
           flex-shrink: 0;
           transition: 0.2s;
        }
        .thumb-btn.active { border-color: #10b981; }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

        /* --- INFO SECTION --- */
        .info-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .breadcrumbs { font-size: 13px; color: #64748b; font-weight: 500; }
        .crumb-link { cursor: pointer; transition: 0.2s; }
        .crumb-link:hover { color: #10b981; }
        .share-btn { background: none; border: none; font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; }

        .product-title {
           font-size: 42px;
           font-weight: 800;
           line-height: 1.1;
           margin-bottom: 16px;
           letter-spacing: -0.02em;
           color: #0f172a;
        }

        .meta-stats { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .rating-block { display: flex; align-items: center; gap: 6px; background: #fffbeb; padding: 6px 12px; border-radius: 20px; font-weight: 700; color: #92400e; font-size: 13px; }
        .reviews { color: #b45309; font-weight: 500; text-decoration: underline; cursor: pointer; }
        .dot { color: #cbd5e1; }
        .unit-label { font-size: 13px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 6px 12px; border-radius: 20px; }

        .price-container { margin-bottom: 24px; }
        .current-price { font-size: 36px; font-weight: 800; color: #10b981; line-height: 1; }
        .discount-info { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
        .old-price { font-size: 18px; color: #94a3b8; text-decoration: line-through; font-weight: 500; }
        .save-pill { font-size: 12px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 4px 8px; border-radius: 6px; }
        .tax-note { font-size: 12px; color: #94a3b8; margin-top: 4px; display: block; }

        .short-desc { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .divider { border: none; border-top: 1px solid #f1f5f9; margin: 24px 0; }

        /* --- ACTIONS --- */
        .action-row { display: flex; gap: 16px; height: 56px; margin-bottom: 32px; }
        .qty-selector {
           display: flex;
           align-items: center;
           justify-content: space-between;
           width: 140px;
           background: #f8fafc;
           border-radius: 16px;
           padding: 4px;
           border: 1px solid #e2e8f0;
        }
        .qty-selector button {
           width: 40px;
           height: 100%;
           border: none;
           background: white;
           border-radius: 12px;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #0f172a;
           box-shadow: 0 1px 2px rgba(0,0,0,0.05);
           transition: 0.1s;
        }
        .qty-selector button:active { transform: scale(0.95); }
        .qty-selector span { font-weight: 700; font-size: 18px; }

        .add-to-cart-btn {
           flex: 1;
           background: #10b981;
           color: white;
           border: none;
           border-radius: 16px;
           font-size: 16px;
           font-weight: 700;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 10px;
           cursor: pointer;
           transition: 0.2s;
           box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
        }
        .add-to-cart-btn:hover { background: #059669; transform: translateY(-2px); }

        /* --- FEATURES & DETAILS --- */
        .features-grid {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 16px;
           margin-bottom: 32px;
        }
        .feature-card {
           display: flex;
           align-items: center;
           gap: 12px;
           padding: 16px;
           border-radius: 16px;
           border: 1px solid #f1f5f9;
           background: #fff;
        }
        .icon-box {
           width: 40px;
           height: 40px;
           border-radius: 10px;
           background: #f0fdf4;
           color: #16a34a;
           display: flex;
           align-items: center;
           justify-content: center;
        }
        .feature-card h4 { font-size: 14px; font-weight: 700; margin: 0 0 2px 0; }
        .feature-card p { font-size: 12px; color: #64748b; margin: 0; }

        .description-box {
           background: #f8fafc;
           padding: 24px;
           border-radius: 20px;
        }
        .description-box h3 { font-size: 18px; font-weight: 700; margin: 0 0 12px 0; }
        .description-box p { font-size: 15px; line-height: 1.7; color: #475569; margin: 0; }

        /* --- MOBILE --- */
        @media (max-width: 900px) {
           .main-grid { grid-template-columns: 1fr; gap: 32px; }
           .gallery-section { position: static; }
           .product-title { font-size: 32px; }
           .page-wrapper { padding-top: 100px; }
           .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}