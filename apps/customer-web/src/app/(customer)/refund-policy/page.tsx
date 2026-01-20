"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function RefundPolicyPage() {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <article className="document-card">
          <header className="doc-header">
            <h1 className="doc-title shine-title">Refund & Cancellation Policy</h1>
            <p className="last-updated">Last Updated: January 2026</p>
          </header>

          <div className="doc-content">
            <section>
              <h2>1. Overview</h2>
              <p>
                At Cane & Tender, we strive to deliver the freshest products. Due to the perishable nature 
                of our goods (fresh juices and tender coconuts), we have strict guidelines regarding refunds and cancellations.
              </p>
            </section>

            <section>
              <h2>2. Order Cancellation</h2>
              <p>
                You may cancel your order within 5 minutes of placing it. Once the order has been processed 
                or dispatched, cancellations are not permitted.
              </p>
            </section>

            <section>
              <h2>3. Refunds</h2>
              <p>Refunds are initiated only under the following conditions:</p>
              <ul>
                <li>The item delivered was damaged or spoiled.</li>
                <li>The wrong item was delivered.</li>
                <li>The package was tampered with during delivery.</li>
              </ul>
              <p>
                Please report any issues to <strong>support@caneandtender.com</strong> within 1 hour of delivery with photographic evidence.
              </p>
            </section>

            <section>
              <h2>4. Processing Time</h2>
              <p>
                Approved refunds will be processed within 5-7 business days and credited back to the original payment method.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />

      <style jsx>{`
        .page-wrapper { background: #f8fafc; min-height: 100vh; }
        .main-content { padding-top: 130px; padding-bottom: 100px; animation: slideUp 0.6s ease-out; }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* --- SHINE TITLE --- */
        .shine-title {
          background: linear-gradient(to right, #052e16 20%, #16a34a 40%, #16a34a 60%, #052e16 80%);
          background-size: 200% auto;
          color: #052e16;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }

        /* Document Card Styles */
        .document-card {
          max-width: 850px;
          margin: 0 auto;
          background: #ffffff;
          padding: 60px;
          border-radius: 24px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }

        .doc-header { text-align: center; margin-bottom: 3rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 2rem; }
        .doc-title { font-size: 2.8rem; font-weight: 800; margin-bottom: 0.5rem; font-family: serif; line-height: 1.2; }
        .last-updated { color: #94a3b8; font-size: 0.95rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

        .doc-content section { margin-bottom: 3rem; }
        .doc-content h2 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
        .doc-content p { color: #475569; line-height: 1.8; margin-bottom: 1rem; font-size: 1.05rem; }
        .doc-content ul { padding-left: 1.5rem; color: #475569; line-height: 1.8; margin-bottom: 1rem; }
        .doc-content li { margin-bottom: 0.5rem; }

        @media (max-width: 768px) {
          .document-card { padding: 30px; margin: 0 20px; }
          .doc-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}