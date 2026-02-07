"use client";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import {CategoryCarousel} from "@/features/categories/components/CategoryCarousel";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pt-10 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-sm text-slate-400 font-medium">Browse our full range of products</p>
        </div>

        {/* Calling your existing file here */}
        <CategoryCarousel />
      </main>

      <Footer />
    </div>
  );
}