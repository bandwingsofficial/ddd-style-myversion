"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* FIXED: Increased padding-top from 110px to 160px to clear the header */}
      <main className="animate-fade-in-up pb-20 pt-[160px] md:pt-[180px]">
        <section className="mx-auto max-w-[1100px] px-6">
          
          {/* Page Header */}
          <header className="mb-[60px] text-center">
            <h1 className="animate-shine mb-4 bg-gradient-to-r from-[#052e16] via-[#4ade80] to-[#052e16] bg-[length:200%_auto] bg-clip-text font-serif text-5xl font-extrabold text-transparent">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-500">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </header>

          {/* Content Grid */}
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:grid-cols-[1fr_1.5fr]">
            
            {/* Contact Info Column */}
            <div className="flex flex-col justify-center bg-[#052e16] p-10 text-white md:p-[50px]">
              <div className="mb-12">
                <h3 className="mb-2 text-3xl font-semibold text-white">Contact Information</h3>
                <p className="text-base text-[#bbf7d0]">
                  Fill up the form or reach out to us directly.
                </p>
              </div>

              <div className="flex flex-col gap-8">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#4ade80]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#86efac]">
                      Email Us
                    </span>
                    <p className="text-lg text-white">support@caneandtender.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#4ade80]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#86efac]">
                      Call Us
                    </span>
                    <p className="text-lg text-white">+1 (555) 123-4567</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#4ade80]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#86efac]">
                      Working Hours
                    </span>
                    <p className="text-lg text-white">Mon - Sat: 9 AM - 8 PM</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#4ade80]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#86efac]">
                      Location
                    </span>
                    <p className="text-lg text-white">Malleswaram, Bengaluru, KA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="bg-white p-10 md:p-[50px]">
              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                
                <div className="flex flex-col gap-2.5">
                  <label className="text-[0.95rem] font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-[18px] py-3.5 text-base outline-none transition-all focus:border-[#4ade80] focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,222,128,0.1)]" 
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-[0.95rem] font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-[18px] py-3.5 text-base outline-none transition-all focus:border-[#4ade80] focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,222,128,0.1)]" 
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-[0.95rem] font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea 
                    rows={5} 
                    placeholder="How can we help you?" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-[18px] py-3.5 text-base outline-none transition-all focus:border-[#4ade80] focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,222,128,0.1)]" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border-none bg-[#16a34a] p-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#15803d] hover:shadow-[0_10px_20px_-5px_rgba(22,163,74,0.2)]"
                >
                  Send Message <Send size={18} />
                </button>

              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        .animate-shine {
          animation: shine 4s linear infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}