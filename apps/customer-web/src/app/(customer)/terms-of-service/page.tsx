"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <article className="document-card">
          <header className="doc-header">
            <h1 className="doc-title shine-title">Terms of Service</h1>
            <p className="last-updated">Last Updated: January 2026</p>
          </header>

          <div className="doc-content">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Cane & Tender website ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by these terms, please do not use this Service.
              </p>
            </section>

            <section>
              <h2>2. Use of Services</h2>
              <p>
                You agree to use our services only for lawful purposes. You represent that you are of legal age to form a binding contract 
                and are not a person barred from receiving services under the laws of India or other applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2>3. Product Availability and Pricing</h2>
              <p>
                All products shown on our website are subject to availability. We reserve the right to discontinue any product at any time. 
                Prices for our products are subject to change without notice. We shall not be liable to you for any modification, 
                price change, or suspension of the Service.
              </p>
            </section>

            <section>
              <h2>4. User Accounts</h2>
              <p>
                To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality 
                of your password and account details. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2>5. Limitation of Liability</h2>
              <p>
                In no event shall Cane & Tender, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for 
                any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2>6. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of Karnataka, India, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2>7. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or 
                use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />

      {/* Reusing the EXACT Pro Styles from Refund Policy */}
      <style jsx>{`
        .page-wrapper { background: #f8fafc; min-height: 100vh; }
        .main-content { padding-top: 130px; padding-bottom: 100px; animation: slideUp 0.6s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
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
        .document-card {
          max-width: 850px; margin: 0 auto; background: #ffffff; padding: 60px;
          border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
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