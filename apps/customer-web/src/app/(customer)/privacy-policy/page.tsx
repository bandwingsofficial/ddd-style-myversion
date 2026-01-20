"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <article className="document-card">
          <header className="doc-header">
            <h1 className="doc-title shine-title">Privacy Policy</h1>
            <p className="last-updated">Last Updated: January 2026</p>
          </header>

          <div className="doc-content">
            <section>
              <h2>1. Introduction</h2>
              <p>
                Cane & Tender ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and disclose your personal information.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul>
                <li><strong>Personal Data:</strong> Name, email address, phone number, and delivery address.</li>
                <li><strong>Usage Data:</strong> Information on how you use our website and services.</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>
                We use your data to process orders, manage your account, and improve our services. 
                We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2>4. Contact Us</h2>
              <p>
                If you have questions about this policy, please contact us at privacy@caneandtender.com.
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