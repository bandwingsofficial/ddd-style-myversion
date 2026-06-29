"use client";


import React from "react";
import Link from "next/link";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";


// Components
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import ProductCard from "@/components/product/ProductCard";


// Logic: Import from the SAME file as Step 1
import { useFavorites } from "@/providers/CustomerAuthProvider";


export default function FavoritesPage() {
  const { favorites } = useFavorites();


  return (
    <div className="page-wrapper">
      <Header />


      <main className="main-content">
        <div className="container">
         
          {/* --- EMPTY STATE --- */}
          {favorites.length === 0 ? (
            <div className="empty-container">
              <div className="icon-wrapper">
                <div className="icon-bg-blur"></div>
                <div className="icon-circle">
                  <Heart size={48} color="#cbd5e1" />
                </div>
              </div>


              <h2 className="empty-title">Your wishlist is empty</h2>
              <p className="empty-desc">
                Looks like you haven't added anything to your favorites yet.
                Explore our products and find something you love!
              </p>


              <Link href="/menu" className="cta-button">
                <ShoppingBag size={18} />
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            /* --- POPULATED STATE --- */
            <>
              <header className="page-header">
                <div className="header-left">
                  <div className="header-icon-box">
                    <Heart size={24} className="heart-icon" />
                  </div>
                  <h1 className="title">
                    My Favorites
                    <span className="count-badge">{favorites.length} items</span>
                  </h1>
                </div>


                <Link href="/menu" className="back-link">
                  <ArrowLeft size={16} />
                  Continue Shopping
                </Link>
              </header>


              <div className="grid-layout">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}


        </div>
      </main>


      <Footer />


      <style jsx>{`
        /* --- Layout & Structure --- */
        .page-wrapper {
          background: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }


        .main-content {
          padding-top: 150px; /* Space for fixed header */
          padding-bottom: 60px;
          flex: 1;
        }


        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 2rem;
        }


        /* --- Header Section --- */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1.5rem;
        }


        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }


        .header-icon-box {
          background: #fef2f2;
          padding: 0.6rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
       
        /* Global selector for the Lucide icon */
        .header-icon-box :global(.heart-icon) {
          color: #ef4444;
          fill: #ef4444;
        }


        .title {
          font-size: 2rem;
          font-weight: 800;
          color: #052e16;
          margin: 0;
          display: flex;
          align-items: center;
        }


        .count-badge {
          margin-left: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          vertical-align: middle;
        }


        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #052e16;
        }


        /* --- Grid Layout --- */
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }


        /* --- Empty State Styling --- */
        .empty-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }


        .icon-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }


        .icon-bg-blur {
          position: absolute;
          inset: 0;
          background: #fee2e2;
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.5;
        }


        .icon-circle {
          position: relative;
          background: white;
          padding: 1.5rem;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 10;
        }


        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }


        .empty-desc {
          color: #64748b;
          max-width: 400px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }


        /* --- Updated Link Styling Fix --- */
        :global(.cta-button) {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.5rem !important;
          background: #052e16 !important;
          color: white !important;
          padding: 0.8rem 2rem !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          text-decoration: none !important;
          transition: all 0.2s !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
       
        :global(.cta-button:hover) {
          background: #0f4c28 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }


        /* --- Mobile Responsive --- */
        @media (max-width: 768px) {
          .main-content { padding-top: 100px; padding-bottom: 40px; }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
          }
          .title { font-size: 1.5rem; }
          .count-badge { margin-left: 0.5rem; font-size: 0.75rem; padding: 0.15rem 0.5rem; }
          .grid-layout {
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            gap: 1rem;
          }
          .container { padding: 0 1rem; }
          .empty-container { min-height: 50vh; }
          .empty-title { font-size: 1.25rem; }
          .empty-desc { font-size: 0.9rem; margin-bottom: 1.5rem; width: 100%; max-width: 320px; }
        }


        @media (max-width: 480px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

