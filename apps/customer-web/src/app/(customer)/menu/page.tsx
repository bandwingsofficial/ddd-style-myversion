"use client";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";

export default function MenuPage() {
  const { products, loading } = useProducts();

  return (
    <div className="menu-page">
      <Header />
      
      <main className="main-content">
        <section className="container">
          {/* Simple Left-Aligned Header */}
          <header className="page-header">
            <h1 className="title">Our Menu</h1>
          </header>

          {/* Product Grid */}
          <div className="grid-layout">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {/* Minimal Empty State */}
          {!loading && products.length === 0 && (
            <div className="empty-state">
              <p>No products found. Check back soon!</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .menu-page { 
          background: #ffffff; 
          min-height: 100vh; 
        }
        
        .main-content { 
          padding-top: 110px; /* Space for fixed header */
          padding-bottom: 60px; 
        }
        
        .container { 
          max-width: 1300px; 
          margin: 0 auto; 
          padding: 0 2rem; 
        }

        .page-header {
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .title {
          font-size: 2rem;
          font-weight: 800;
          color: #052e16; /* Deep green to match your brand */
          text-align: left;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .empty-state {
          padding: 4rem 0;
          color: #94a3b8;
          text-align: left;
        }

        @media (max-width: 768px) {
          .main-content { padding-top: 90px; }
          .title { font-size: 1.75rem; }
          .grid-layout { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 1rem; 
          }
          .container { padding: 0 1rem; }
        }
      `}</style>
    </div>
  );
}