"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Leaf, Award, Heart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      
      {/* Inject custom keyframe styles directly so you don't have to touch tailwind.config.js */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}} />

      {/* Decorative Animated Background Ambient Blobs */}
      <div className="absolute top-40 left-1/4 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none" />
      <div className="absolute top-60 right-1/4 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none" />

      <Header />
      
      {/* Main Content */}
      <main className="flex-grow pt-36 pb-20 px-4 z-10 relative">
        
        {/* --- Hero Section --- */}
        <section className="max-w-4xl mx-auto text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium mb-6 shadow-sm hover:bg-emerald-100/70 transition-colors duration-300 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Est. 2026
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Purity in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 bg-[length:200%_auto] hover:bg-right transition-all duration-1000">Every Sip.</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed dynamic-delay">
            At CanTen, we are on a mission to redefine freshness by delivering 
            nature's finest juices directly from the farm to your doorstep.
          </p>
        </section>

        {/* --- Values Grid --- */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <ValueCard 
                icon={<Leaf className="w-6 h-6" />}
                title="100% Organic"
                desc="Sourced directly from certified organic farms, ensuring no pesticides touch your drink."
              />
            </div>

            {/* Card 2 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <ValueCard 
                icon={<ShieldCheck className="w-6 h-6" />}
                title="Hygiene First"
                desc="Prepared in state-of-the-art facilities following stringent safety protocols."
              />
            </div>

            {/* Card 3 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
              <ValueCard 
                icon={<Heart className="w-6 h-6" />}
                title="Made with Love"
                desc="We believe in the healing power of natural ingredients, served with care."
              />
            </div>

            {/* Card 4 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <ValueCard 
                icon={<Award className="w-6 h-6" />}
                title="Premium Quality"
                desc="We select only the tenderest coconuts and the juiciest sugarcane stalks."
              />
            </div>
          </div>
        </section>

        {/* --- Story Section --- */}
        <section className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '750ms' }}>
          <div className="group/story bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgb(16,185,129,0.08)] overflow-hidden relative transition-all duration-500 hover:-translate-y-1">
            
            {/* Top Animated Gradient Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 bg-[length:200%_auto] group-hover/story:bg-right transition-all duration-1000" />
            
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 transition-colors duration-300 group-hover/story:text-emerald-700">Our Journey</h2>
              <div className="prose prose-slate mx-auto">
                <p className="text-slate-500 leading-loose text-lg transition-colors duration-300 group-hover/story:text-slate-600">
                  Founded in 2026, <span className="font-semibold text-slate-800 group-hover/story:text-emerald-900 transition-colors">CanTen</span> began with a simple question: "Why is it so hard to find 
                  authentic, hygienic sugarcane juice?" What started as a small stall in Bengaluru has 
                  grown into a trusted brand, connecting urban consumers with the raw, refreshing taste 
                  of nature. We bridge the gap between rural freshness and modern convenience.
                </p>
              </div>
              
              {/* Decorative signature or mark with draw effect on hover */}
              <div className="mt-8 flex justify-center opacity-20 group-hover/story:opacity-50 transition-opacity duration-500">
                 <svg width="100" height="20" viewBox="0 0 100 20" fill="none" stroke="currentColor" className="text-emerald-700 stroke-[2] transition-transform duration-700 group-hover/story:scale-110">
                    <path d="M0 10 Q 25 20, 50 10 T 100 10" fill="none" />
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

// Reusable Card Component with interactive Hover micro-interactions
function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group bg-white p-6 h-full rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.06)] transition-all duration-500 hover:-translate-y-2 flex flex-col items-start">
      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
        {desc}
      </p>
    </div>
  );
}