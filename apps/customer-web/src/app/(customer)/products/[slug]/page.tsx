"use client";

import { useParams } from "next/navigation";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { 
  ShoppingBag, ShieldCheck, Truck, Star, Heart, 
  Minus, Plus, Share2, Leaf, ChevronRight 
} from "lucide-react";
import { useState } from "react";

// --- CONFIG ---
const BACKEND_URL = "https://api.dev.local:4000";

const getImageUrl = (data: any) => {
  if (!data) return "/placeholder.jpg"; 
  let path = "";
  if (typeof data === 'string') path = data;
  else if (typeof data === 'object') path = data.mainImage || data.url || (Array.isArray(data) ? data[0] : "");
  
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
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- DERIVED STATE ---
  // Safe defaults to prevent crashes while loading or if data is missing
  const activeImageUrl = product ? (selectedImage || getImageUrl(product.images)) : "";
  const originalPrice = product?.price?.originalPrice || 0;
  const discountPrice = product?.price?.discountPrice;
  const currentPrice = (discountPrice && discountPrice < originalPrice) ? discountPrice : originalPrice;
  const savings = originalPrice - currentPrice;
  const percentageOff = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="page-wrapper">
      <Header />

      <main className="main-content">
        {!product ? (
          // --- LOADING STATE ---
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Squeezing the details...</p>
          </div>
        ) : (
          // --- PRODUCT CONTENT ---
          <div className="container">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
              <span>Home</span> <ChevronRight size={14} />
              <span>Menu</span> <ChevronRight size={14} />
              <span className="current">{product.name.value}</span>
            </nav>

            <div className="product-grid">
              
              {/* --- LEFT COLUMN: GALLERY --- */}
              <div className="gallery-section">
                <div className="main-image-frame">
                   <img src={activeImageUrl} alt={product.name.value} className="product-img" />
                   
                   {/* Floating Badges */}
                   <div className="badges">
                     {product.trendState?.trending && <span className="badge trending">Trending</span>}
                     {percentageOff > 0 && <span className="badge discount">-{percentageOff}% OFF</span>}
                   </div>
                   
                   <button 
                     className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} 
                     onClick={() => setIsWishlisted(!isWishlisted)}
                   >
                      <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#475569"} />
                   </button>
                </div>

                {/* Thumbnails Strip */}
                {product.images?.galleryImages?.length > 0 && (
                  <div className="thumbs-track">
                     {[getImageUrl(product.images), ...product.images.galleryImages.map((i:any) => getImageUrl(i))].map((img, idx) => (
                       <button 
                         key={idx} 
                         className={`thumb-btn ${activeImageUrl === img ? 'selected' : ''}`}
                         onClick={() => setSelectedImage(img)}
                       >
                         <img src={img} alt={`thumb-${idx}`} />
                       </button>
                     ))}
                  </div>
                )}
              </div>

              {/* --- RIGHT COLUMN: DETAILS --- */}
              <div className="details-section">
                 <div className="header-row">
                    <h1 className="title">{product.name.value}</h1>
                    <button className="share-btn"><Share2 size={20} /></button>
                 </div>

                 {/* Ratings & Meta */}
                 <div className="meta-row">
                    {product.rating && (
                        <div className="rating-badge">
                        <Star size={14} fill="#f59e0b" stroke="#f59e0b" /> 
                        <span>{product.rating.average || "New"}</span>
                        <span className="reviews">({product.rating.count || 0} reviews)</span>
                        </div>
                    )}
                    <span className="dot">•</span>
                    {product.unit && (
                        <span className="unit-badge">{product.unit.value} {product.unit.type}</span>
                    )}
                 </div>

                 {/* Price Block */}
                 <div className="price-block">
                    <div className="price-row">
                       <span className="current-price">₹{currentPrice}</span>
                       {percentageOff > 0 && (
                         <>
                           <span className="old-price">₹{originalPrice}</span>
                           <span className="savings-pill">Save ₹{savings}</span>
                         </>
                       )}
                    </div>
                    <span className="tax-note">Inclusive of all taxes</span>
                 </div>

                 <p className="description">{product.shortDescription}</p>

                 {/* Add to Cart Actions */}
                 <div className="actions-panel">
                    <div className="qty-counter">
                       <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16}/></button>
                       <span className="count-val">{quantity}</span>
                       <button onClick={() => setQuantity(quantity + 1)}><Plus size={16}/></button>
                    </div>
                    <button className="add-cart-btn">
                       <ShoppingBag size={18} />
                       <span>Add to Order • ₹{currentPrice * quantity}</span>
                    </button>
                 </div>

                 {/* Features Grid */}
                 <div className="features-grid">
                    <div className="feature-item">
                       <div className="icon-box green"><Leaf size={18} /></div>
                       <div className="feature-text">
                          <strong>100% Natural</strong>
                          <span>Farm fresh</span>
                       </div>
                    </div>
                    <div className="feature-item">
                       <div className="icon-box blue"><Truck size={18} /></div>
                       <div className="feature-text">
                          <strong>Fast Delivery</strong>
                          <span>30-45 mins</span>
                       </div>
                    </div>
                    <div className="feature-item">
                       <div className="icon-box purple"><ShieldCheck size={18} /></div>
                       <div className="feature-text">
                          <strong>Hygienic</strong>
                          <span>Safety checks</span>
                       </div>
                    </div>
                 </div>

                 {/* Long Description */}
                 {product.longDescription && (
                     <div className="info-card">
                        <h3>About this item</h3>
                        <p>{product.longDescription}</p>
                     </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        /* --- LAYOUT --- */
        .page-wrapper {
          background-color: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          padding-top: 135px; /* Header Offset */
          padding-bottom: 80px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* --- LOADING --- */
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            color: #16a34a;
            font-weight: 600;
        }
        .spinner {
            width: 40px; height: 40px;
            border: 3px solid #f0fdf4;
            border-top: 3px solid #16a34a;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* --- BREADCRUMBS --- */
        .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #64748b;
            margin-bottom: 24px;
            font-weight: 500;
        }
        .breadcrumbs .current { color: #166534; font-weight: 600; }

        /* --- PRODUCT GRID --- */
        .product-grid {
            display: grid;
            grid-template-columns: 1.1fr 1fr;
            gap: 4rem;
            align-items: start;
        }

        /* --- GALLERY SECTION --- */
        .gallery-section {
            position: sticky;
            top: 120px; /* Stick below header */
        }

        .main-image-frame {
            position: relative;
            width: 100%;
            aspect-ratio: 1/1;
            background: #f8fafc;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .product-img { width: 100%; height: 100%; object-fit: cover; }

        .badges { position: absolute; top: 16px; left: 16px; display: flex; flex-direction: column; gap: 8px; }
        .badge { padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .badge.trending { background: #16a34a; }
        .badge.discount { background: #ef4444; }

        .wishlist-btn {
            position: absolute; top: 16px; right: 16px;
            width: 44px; height: 44px;
            border-radius: 50%;
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: 0.2s;
        }
        .wishlist-btn:hover { transform: scale(1.05); }
        .wishlist-btn.active { background: #fef2f2; border-color: #fecaca; }

        .thumbs-track { display: flex; gap: 12px; margin-top: 16px; overflow-x: auto; padding-bottom: 4px; }
        .thumb-btn { 
            width: 70px; height: 70px; 
            border-radius: 12px; 
            border: 2px solid transparent; 
            cursor: pointer; 
            overflow: hidden; 
            background: #f8fafc; 
            padding: 0;
            transition: 0.2s;
        }
        .thumb-btn.selected { border-color: #16a34a; }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

        /* --- DETAILS SECTION --- */
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .title { 
            font-size: 2.5rem; 
            font-weight: 800; 
            color: #052e16; 
            margin: 0; 
            line-height: 1.1; 
            letter-spacing: -0.02em; 
        }
        .share-btn { 
            background: #f1f5f9; 
            border: none; 
            width: 40px; height: 40px; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            color: #64748b; 
            cursor: pointer; 
            flex-shrink: 0;
            transition: 0.2s;
        }
        .share-btn:hover { background: #e2e8f0; color: #0f172a; }

        .meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .rating-badge { 
            display: flex; align-items: center; gap: 6px; 
            background: #fffbeb; color: #92400e; 
            padding: 4px 12px; border-radius: 100px; 
            font-weight: 700; font-size: 13px;
        }
        .unit-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; }
        .dot { color: #cbd5e1; }

        .price-block { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
        .price-row { display: flex; align-items: baseline; gap: 12px; }
        .current-price { font-size: 2rem; font-weight: 800; color: #16a34a; }
        .old-price { font-size: 1.1rem; color: #94a3b8; text-decoration: line-through; font-weight: 500; }
        .savings-pill { background: #dcfce7; color: #166534; font-size: 0.8rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
        .tax-note { display: block; font-size: 12px; color: #94a3b8; margin-top: 4px; }

        .description { font-size: 1.1rem; line-height: 1.6; color: #334155; margin-bottom: 32px; }

        /* Actions */
        .actions-panel { display: flex; gap: 16px; margin-bottom: 32px; height: 54px; }
        .qty-counter { 
            display: flex; align-items: center; justify-content: space-between; 
            width: 130px; 
            background: #f8fafc; border: 1px solid #e2e8f0; 
            border-radius: 12px; padding: 4px; 
        }
        .qty-counter button { 
            width: 36px; height: 100%; 
            border: none; background: #fff; border-radius: 8px; 
            cursor: pointer; color: #0f172a; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
            display: flex; align-items: center; justify-content: center; 
        }
        .qty-counter button:active { transform: scale(0.95); }
        .count-val { font-size: 16px; font-weight: 700; }

        .add-cart-btn { 
            flex: 1; 
            background: #16a34a; 
            color: white; 
            border: none; border-radius: 12px; 
            font-size: 1rem; font-weight: 700; 
            display: flex; align-items: center; justify-content: center; gap: 10px; 
            cursor: pointer; transition: 0.2s; 
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); 
        }
        .add-cart-btn:hover { background: #15803d; transform: translateY(-1px); }

        /* Features */
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .feature-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #f1f5f9; border-radius: 12px; background: #fff; }
        .icon-box { 
            width: 36px; height: 36px; border-radius: 8px; 
            display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
        }
        .icon-box.green { background: #dcfce7; color: #166534; }
        .icon-box.blue { background: #dbeafe; color: #1e40af; }
        .icon-box.purple { background: #f3e8ff; color: #6b21a8; }
        
        .feature-text { display: flex; flex-direction: column; }
        .feature-text strong { font-size: 13px; font-weight: 700; color: #0f172a; }
        .feature-text span { font-size: 11px; color: #64748b; }

        .info-card { background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #f1f5f9; }
        .info-card h3 { font-size: 1rem; font-weight: 700; margin: 0 0 12px 0; color: #0f172a; }
        .info-card p { font-size: 0.95rem; line-height: 1.6; color: #475569; margin: 0; }

        /* --- RESPONSIVE --- */
        @media (max-width: 900px) {
            .product-grid { grid-template-columns: 1fr; gap: 2rem; }
            .gallery-section { position: static; }
            .title { font-size: 2rem; }
        }
        @media (max-width: 640px) {
            .container { padding: 0 1rem; }
            .main-content { padding-top: 90px; }
            .actions-panel { flex-direction: column; height: auto; }
            .qty-counter { width: 100%; height: 50px; }
            .add-cart-btn { width: 100%; height: 50px; }
        }
      `}</style>
    </div>
  );
}