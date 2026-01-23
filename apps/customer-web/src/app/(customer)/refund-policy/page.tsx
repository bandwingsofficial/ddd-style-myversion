"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Main Content
          - pt-[130px]: Padding top to account for fixed header
          - pb-[100px]: Padding bottom for spacing before footer
          - animate-slide-up: Custom animation class defined below
      */}
      <main className="animate-slide-up pb-[100px] pt-[130px]">
        <article className="mx-auto max-w-[850px] rounded-3xl border border-slate-200 bg-white p-[30px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] md:p-[60px]">
          
          {/* Document Header */}
          <header className="mb-12 border-b border-slate-100 pb-8 text-center">
            <h1 className="animate-shine mb-2 bg-gradient-to-r from-[#052e16] via-[#16a34a] to-[#052e16] bg-[length:200%_auto] bg-clip-text font-serif text-[2rem] font-extrabold leading-tight text-transparent md:text-[2.8rem]">
              Refund & Cancellation Policy
            </h1>
            <p className="text-[0.95rem] font-medium uppercase tracking-wide text-slate-400">
              Last Updated: January 2026
            </p>
          </header>

          {/* Document Content */}
          <div className="text-lg leading-relaxed text-slate-600">
            <section className="mb-12">
              <h2 className="mb-4 text-[1.4rem] font-bold text-slate-800">1. Overview</h2>
              <p className="mb-4">
                At Cane & Tender, we strive to deliver the freshest products. Due to the perishable nature 
                of our goods (fresh juices and tender coconuts), we have strict guidelines regarding refunds and cancellations.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-[1.4rem] font-bold text-slate-800">2. Order Cancellation</h2>
              <p className="mb-4">
                You may cancel your order within 5 minutes of placing it. Once the order has been processed 
                or dispatched, cancellations are not permitted.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-[1.4rem] font-bold text-slate-800">3. Refunds</h2>
              <p className="mb-4">Refunds are initiated only under the following conditions:</p>
              <ul className="mb-4 list-disc pl-6">
                <li className="mb-2">The item delivered was damaged or spoiled.</li>
                <li className="mb-2">The wrong item was delivered.</li>
                <li className="mb-2">The package was tampered with during delivery.</li>
              </ul>
              <p className="mb-4">
                Please report any issues to <strong className="font-semibold text-slate-900">support@caneandtender.com</strong> within 1 hour of delivery with photographic evidence.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-[1.4rem] font-bold text-slate-800">4. Processing Time</h2>
              <p className="mb-4">
                Approved refunds will be processed within 5-7 business days and credited back to the original payment method.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />

      {/* Custom Keyframe Animations */}
      <style jsx global>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        .animate-shine {
          animation: shine 4s linear infinite;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}