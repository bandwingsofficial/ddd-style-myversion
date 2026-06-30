"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function PrivacyPolicyPage() {
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
                Privacy Policy
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
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">1</span>
                Introduction
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                <span className="font-semibold text-slate-800">CanTen</span> ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and disclose your personal information when you use our website and services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">2</span>
                Information We Collect
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We may collect the following types of information to provide better services to all our users:
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex gap-3 text-slate-600">
                  <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Personal Data:</strong> Name, email address, phone number, and delivery address required for processing orders.
                  </span>
                </li>
                <li className="flex gap-3 text-slate-600">
                  <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Usage Data:</strong> Information on how you access and use our website, including device information and browsing patterns.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">3</span>
                How We Use Your Information
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                We use your data to process orders, manage your account, and improve our services. 
                We adhere to strict data protection standards and <span className="font-semibold text-slate-800">do not sell your personal data</span> to third parties for marketing purposes.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">4</span>
                Contact Us
              </h2>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <p className="text-slate-600 mb-2">
                  If you have questions about this policy or our data practices, please contact our Data Protection Officer:
                </p>
                <a href="mailto:connect@canten.com" className="text-emerald-600 font-semibold hover:underline hover:text-emerald-700 transition-colors">
                  connect@canten.com
                </a>
              </div>
            </section>

          </div>
        </article>

      </main>

      <Footer />
    </div>
  );
}