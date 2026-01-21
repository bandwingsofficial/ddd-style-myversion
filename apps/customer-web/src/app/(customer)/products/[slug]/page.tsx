"use client";

import { useParams } from "next/navigation";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import { ShoppingBag, ShieldCheck, Truck } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const getImageUrl = (path?: string) => {
  if (!path || path.trim() === "") return "";
  return path.startsWith("http")
    ? path
    : `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useProductBySlug(slug);

  if (!product) return <div className="loading">Refining your juice...</div>;

  const mainImageUrl = getImageUrl(product.images.mainImage);

  // Determine current price vs original price
  const currentPrice = product.price.discountPrice || product.price.originalPrice;
  const isDiscounted = product.price.discountPrice && product.price.discountPrice < product.price.originalPrice;

  return (
    <div className="product-page">
      <div className="details-container">
        <div className="image-gallery">
          <div className="main-image-wrapper">
             <img src={mainImageUrl} alt={product.name.value} />
          </div>
          {/* Optional: Add gallery preview here later using product.images.galleryImages */}
        </div>

        <div className="info-panel">
          <nav className="breadcrumb">Products / {product.name.value}</nav>
          <h1 className="display-title">{product.name.value}</h1>
          
          <div className="pricing-section">
            <span className="price-tag">₹{currentPrice}</span>
            {isDiscounted && (
               <span className="old-price">₹{product.price.originalPrice}</span>
            )}
            <span className="stock-status">In Stock</span>
          </div>

          <p className="product-desc">
            {product.shortDescription || product.longDescription || "Experience the natural sweetness of our freshly pressed juice."}
          </p>

          <div className="actions">
            <button className="add-btn">
              <ShoppingBag size={20} />
              Add to Bag
            </button>
          </div>

          <div className="features">
            <div className="feature-item">
              <ShieldCheck size={20} className="text-green-600" />
              <span>100% Organic & Pure</span>
            </div>
            <div className="feature-item">
              <Truck size={20} className="text-green-600" />
              <span>Express Delivery (30 mins)</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-page { padding: 140px 2rem 80px 2rem; background: #fff; min-height: 100vh; }
        .details-container {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
        }

        .main-image-wrapper {
          background: #f8fafc;
          border-radius: 32px;
          overflow: hidden;
          position: sticky;
          top: 120px;
        }

        .main-image-wrapper img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
        }

        .breadcrumb {
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .display-title {
          font-size: 3.5rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .pricing-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .price-tag {
          font-size: 2rem;
          font-weight: 800;
          color: #16a34a;
        }
        
        .old-price {
          font-size: 1.2rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
        }

        .stock-status {
          background: #f0fdf4;
          color: #16a34a;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .product-desc {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .add-btn {
          width: 100%;
          background: #16a34a;
          color: white;
          border: none;
          padding: 1.25rem;
          border-radius: 18px;
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: #15803d;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(22, 163, 74, 0.4);
        }

        .features {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #f1f5f9;
          display: grid;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #334155;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .details-container { grid-template-columns: 1fr; gap: 2.5rem; }
          .display-title { font-size: 2.5rem; }
          .product-page { padding-top: 100px; }
        }
      `}</style>
    </div>
  );
}