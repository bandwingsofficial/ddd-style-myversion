"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Leaf, Award, Heart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />
      
      {/* Main Content with top padding to account for fixed header if needed */}
      <main className="flex-grow pt-24 pb-20 px-4">
        
        {/* --- Hero Section --- */}
        <section className="max-w-4xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Est. 2026
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Purity in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Every Sip.</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            At Cane & Tender, we are on a mission to redefine freshness by delivering 
            nature's finest juices directly from the farm to your doorstep.
          </p>
        </section>

        {/* --- Values Grid --- */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <ValueCard 
              icon={<Leaf className="w-6 h-6" />}
              title="100% Organic"
              desc="Sourced directly from certified organic farms, ensuring no pesticides touch your drink."
            />

            {/* Card 2 */}
            <ValueCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Hygiene First"
              desc="Prepared in state-of-the-art facilities following stringent safety protocols."
            />

            {/* Card 3 */}
            <ValueCard 
              icon={<Heart className="w-6 h-6" />}
              title="Made with Love"
              desc="We believe in the healing power of natural ingredients, served with care."
            />

            {/* Card 4 */}
            <ValueCard 
              icon={<Award className="w-6 h-6" />}
              title="Premium Quality"
              desc="We select only the tenderest coconuts and the juiciest sugarcane stalks."
            />
          </div>
        </section>

        {/* --- Story Section --- */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
            {/* Top Gradient Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500" />
            
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Journey</h2>
              <div className="prose prose-slate mx-auto">
                <p className="text-slate-500 leading-loose text-lg">
                  Founded in 2026, <span className="font-semibold text-slate-800">Cane & Tender</span> began with a simple question: "Why is it so hard to find 
                  authentic, hygienic sugarcane juice?" What started as a small stall in Bengaluru has 
                  grown into a trusted brand, connecting urban consumers with the raw, refreshing taste 
                  of nature. We bridge the gap between rural freshness and modern convenience.
                </p>
              </div>
              
              {/* Decorative signature or mark */}
              <div className="mt-8 flex justify-center opacity-20">
                 <svg width="100" height="20" viewBox="0 0 100 20" fill="none" stroke="currentColor" className="text-emerald-900">
                    <path d="M0 10 Q 25 20, 50 10 T 100 10" strokeWidth="2" fill="none" />
                 </svg>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

// Reusable Card Component for cleaner code
function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}