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
          <header className="page-header">
            <h1 className="title">Our Menu</h1>
          </header>

          <div className="grid-layout">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

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
          padding-top: 110px; 
          padding-bottom: 60px; 
        }
        
        .container { 
          max-width: 1400px; /* Increased max-width to allow 5 items breathing room */
          margin: 0 auto; 
          padding: 0 1.5rem; 
        }

        .page-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .title {
          font-size: 2rem;
          font-weight: 800;
          color: #052e16;
          text-align: left;
        }

        /* --- GRID CONFIGURATION --- */
        .grid-layout {
          display: grid;
          /* Default: 5 items per row for standard laptops/desktops */
          grid-template-columns: repeat(5, 1fr); 
          gap: 1.25rem; /* Slightly tighter gap to help fit 5 items */
        }

        .empty-state {
          padding: 4rem 0;
          color: #94a3b8;
          text-align: left;
        }

        /* --- RESPONSIVE BREAKPOINTS --- */
        
        /* Only drop to 4 items if screen is smaller than 1200px */
        @media (max-width: 1200px) {
          .grid-layout {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        /* Drop to 3 items on tablets/smaller laptops */
        @media (max-width: 992px) {
          .grid-layout { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 1rem;
          }
        }

        /* Drop to 2 items on mobile landscape / large phones */
        @media (max-width: 640px) {
          .main-content { padding-top: 90px; }
          .title { font-size: 1.75rem; }
          .container { padding: 0 1rem; }
          
          .grid-layout { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 0.75rem; 
          }
        }

        /* (Optional) 1 item on very small phones if needed, otherwise 2 looks okay */
        @media (max-width: 380px) {
          .grid-layout { 
            grid-template-columns: 1fr; 
          }
        }
      `}</style>
    </div>
  );
}