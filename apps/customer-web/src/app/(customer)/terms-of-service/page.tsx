"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />
      
      {/* pt-36 ensures content clears fixed header.
        animate-in gives a smooth entrance.
      */}
      <main className="flex-grow pt-36 pb-20 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <article className="max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
          
          {/* Document Header */}
          <header className="px-8 py-12 sm:px-12 md:py-16 text-center border-b border-slate-100 bg-slate-50/30">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 font-serif">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800">
                Terms of Service
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Last Updated: January 2026
            </p>
          </header>

          {/* Document Content */}
          <div className="p-8 sm:p-12 md:p-16 space-y-12">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">1</span>
                Acceptance of Terms
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                By accessing and using the <span className="font-semibold text-slate-800">CanTen</span> website ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by these terms, please do not use this Service.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">2</span>
                Use of Services
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                You agree to use our services only for lawful purposes. You represent that you are of legal age to form a binding contract 
                and are not a person barred from receiving services under the laws of India or other applicable jurisdiction.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">3</span>
                Product Availability and Pricing
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                All products shown on our website are subject to availability. We reserve the right to discontinue any product at any time. 
                Prices for our products are subject to change without notice. We shall not be liable to you for any modification, 
                price change, or suspension of the Service.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">4</span>
                User Accounts
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality 
                of your password and account details. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">5</span>
                Limitation of Liability
              </h2>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-slate-600 leading-relaxed">
                In no event shall <span className="font-semibold text-slate-900">CanTen</span>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for 
                any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses.
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">6</span>
                Governing Law
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                These Terms shall be governed and construed in accordance with the laws of <span className="font-semibold text-slate-800">Karnataka, India</span>, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold flex-shrink-0">7</span>
                Changes to Terms
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or 
                use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>
            
          </div>
        </article>

      </main>

      <Footer />
    </div>
  );
}