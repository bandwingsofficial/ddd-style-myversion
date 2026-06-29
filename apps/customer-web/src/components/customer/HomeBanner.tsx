"use client";


import React from "react";
import Link from "next/link";
import Image from "next/image";


export default function HomeBanner() {
  return (
    <section className="home-banner">
      {/* --- INTEGRATED HERO WRAPPER --- */}
      <div className="hero-wrapper">
        <Image
          src="/images/homebg.png"
          alt="Fresh Juice Ingredients Background"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "bottom center"
          }}
          priority
          unoptimized
        />
       
        {/* Darkening subtle overlay gradient to ensure clean text contrast over the splash art */}
        <div className="hero-overlay" />


        {/* --- CONTENT LAYER LAYERED DIRECTLY OVER IMAGE --- */}
        <div className="content-container">
          <div className="fade-in-up content-wrapper">
            <h1 className="main-heading">
              Freshness Delivered <span className="highlight-text">Fast.</span>
            </h1>
           
            <p className="description">
              Natural, Healthy & Refreshing Sugarcane and Coconut Juices
              <br className="desktop-only" /> Delivered to Your Doorstep.
            </p>


            <Link href="/menu" style={{ textDecoration: 'none' }}>
              <button className="order-button">
                Order Now
              </button>
            </Link>
          </div>
        </div>
      </div>


      <style jsx>{`
        /* MAIN BANNER CONTAINER CONTAINER */
        .home-banner {
          background-color: #ffffff;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding-top: 111px; /* Dynamically pushes banner layout frame exactly below your custom global header */
        }


        @media (max-width: 768px) {
          .home-banner {
            padding-top: 65px; /* Tighter mobile top alignment compensation bounds */
          }
        }


        /* INTEGRATED HERO DESIGN FRAME */
        .hero-wrapper {
          position: relative;
          width: 100%;
          height: 65vh; /* Perfect sizing balance on phone screen views to clear out unnecessary dead areas */
          display: flex;
          align-items: center;
          justify-content: center;
        }


        @media (min-width: 768px) {
          .hero-wrapper {
            height: calc(100vh - 120px); /* Fully expanded responsive scale viewport frame on desktop desktop views */
          }
        }


        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 100%);
          z-index: 2;
        }


        /* CONTENT LAYER ON TOP OF GRAPHIC ELEMENTS */
        .content-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          margin-top: -12vh; /* Smooth adjustments pull main titles safely over clean splash safezones */
        }


        @media (min-width: 768px) {
          .content-container {
            margin-top: -25vh;
          }
        }


        .content-wrapper {
          text-align: center;
          max-width: 620px;
          text-shadow: 0 2px 10px rgba(255, 255, 255, 0.6); /* Guarantees pristine readability over light splash pixels */
        }


        /* TYPOGRAPHY CONTROL STYLES */
        .main-heading {
          font-size: clamp(2.1rem, 6.5vw, 4.2rem);
          font-weight: 800;
          color: #111827;
          margin: 0 0 10px 0;
          letter-spacing: -1px;
          line-height: 1.15;
        }


        .highlight-text {
          color: #4ca82e;
        }


        .description {
          font-size: clamp(0.95rem, 2.8vw, 1.25rem);
          color: #374151;
          line-height: 1.45;
          margin-bottom: 25px;
          font-weight: 600;
        }


        .desktop-only {
          display: none;
        }


        @media (min-width: 500px) {
          .desktop-only {
            display: inline;
          }
        }


        /* THE CALL TO ACTION BUTTON */
        .order-button {
          color: white;
          border: none;
          padding: 14px 45px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.05rem;
          background: linear-gradient(to bottom, #74b72e, #2e7d32);
          box-shadow: 0 8px 24px rgba(46, 125, 50, 0.35);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }


        .order-button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 28px rgba(76, 168, 46, 0.45);
        }


        .order-button:active {
          transform: translateY(0) scale(0.98);
        }


        /* LOAD IN ANIMATIONS */
        .fade-in-up {
          animation: fadeInUp 0.85s cubic-bezier(0.215, 0.610, 0.355, 1) forwards;
        }


        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}



