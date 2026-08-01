"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/menu?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="customer-page-shell mobile-container">
        <div className="mx-auto max-w-xl pt-4">
          <h1 className="text-2xl font-black text-slate-900">Search Products</h1>
          <p className="mt-2 text-sm text-slate-500">
            Find fresh cane juice, combos, and seasonal specials near you.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none ring-emerald-500/20 transition focus:border-emerald-500 focus:ring-4"
              />
            </div>

            <button
              type="submit"
              className="mt-4 h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 touch-target"
            >
              Search Menu
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-2">
            {["Fresh", "Organic", "Sugar Free", "Combo"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => router.push(`/menu?search=${encodeURIComponent(term)}`)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 touch-target"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
