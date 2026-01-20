"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Leaf, Award, Heart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-title shine-title">Purity in Every Sip.</h1>
            <div className="hero-divider"></div>
            <p className="hero-subtitle">
              At Cane & Tender, we are on a mission to redefine freshness by delivering 
              nature's finest juices directly from the farm to your doorstep.
            </p>
          </div>
        </section>

        {/* Mission Values Grid */}
        <section className="values-section container">
          <div className="grid-layout">
            <div className="value-card">
              <div className="icon-box"><Leaf size={32} color="#16a34a" /></div>
              <h3>100% Organic</h3>
              <p>Sourced directly from certified organic farms, ensuring no pesticides touch your drink.</p>
            </div>
            <div className="value-card">
              <div className="icon-box"><ShieldCheck size={32} color="#16a34a" /></div>
              <h3>Hygiene First</h3>
              <p>Prepared in state-of-the-art facilities following stringent safety protocols.</p>
            </div>
            <div className="value-card">
              <div className="icon-box"><Heart size={32} color="#16a34a" /></div>
              <h3>Made with Love</h3>
              <p>We believe in the healing power of natural ingredients, served with care.</p>
            </div>
            <div className="value-card">
              <div className="icon-box"><Award size={32} color="#16a34a" /></div>
              <h3>Premium Quality</h3>
              <p>We select only the tenderest coconuts and the juiciest sugarcane stalks.</p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="story-container container">
          <div className="story-card">
            <h2 className="shine-title story-title">Our Journey</h2>
            <p>
              Founded in 2026, Cane & Tender began with a simple question: "Why is it so hard to find 
              authentic, hygienic sugarcane juice?" What started as a small stall in Bengaluru has 
              grown into a trusted brand, connecting urban consumers with the raw, refreshing taste 
              of nature. We bridge the gap between rural freshness and modern convenience.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .page-wrapper { background: #fff; min-height: 100vh; }
        .main-content { padding-top: 110px; padding-bottom: 80px; animation: fadeIn 0.8s ease-out; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* --- SHINE TITLE --- */
        .shine-title {
          background: linear-gradient(to right, #052e16 20%, #4ade80 40%, #4ade80 60%, #052e16 80%);
          background-size: 200% auto;
          color: #052e16;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }

        /* Hero */
        .hero-section {
          text-align: center;
          padding: 80px 0;
          background: radial-gradient(circle at center, #f0fdf4 0%, #ffffff 70%);
          margin-bottom: 60px;
        }
        .hero-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 1.5rem; font-family: serif; letter-spacing: -1px; }
        .hero-divider { width: 60px; height: 4px; background: #4ade80; margin: 0 auto 1.5rem auto; border-radius: 2px; }
        .hero-subtitle { font-size: 1.25rem; color: #4b5563; max-width: 700px; margin: 0 auto; line-height: 1.8; }

        /* Values Grid */
        .values-section { margin-bottom: 100px; }
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2.5rem; }
        .value-card {
          padding: 2.5rem;
          border: 1px solid #f1f5f9;
          background: #fff;
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .value-card:hover { transform: translateY(-8px); border-color: #bbf7d0; box-shadow: 0 20px 25px -5px rgba(22, 163, 74, 0.1); }
        .icon-box { margin-bottom: 1.5rem; width: 64px; height: 64px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        h3 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
        p { color: #64748b; line-height: 1.7; font-size: 1rem; }

        /* Story */
        .story-container { display: flex; justify-content: center; }
        .story-card { 
          background: #f8fafc; 
          padding: 80px; 
          border-radius: 32px; 
          max-width: 900px; 
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .story-card::before {
           content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 6px; 
           background: linear-gradient(90deg, #16a34a, #4ade80);
        }
        .story-title { font-size: 2.5rem; margin-bottom: 2rem; font-weight: 800; font-family: serif; }
        .story-card p { font-size: 1.15rem; color: #334155; line-height: 2; }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .story-card { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
}