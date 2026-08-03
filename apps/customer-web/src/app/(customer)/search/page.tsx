"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { typography } from "@/lib/design-tokens";

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
        <div className="mx-auto max-w-xl pt-2">
          <Breadcrumbs items={[{ label: "Search" }]} />

          <h1 className={typography.pageTitle}>Search Products</h1>
          <p className="mt-2 text-sm text-slate-500">
            Find fresh cane juice, combos, and seasonal specials near you.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <Input
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="h-14 pl-12 text-base shadow-sm"
              />
            </div>

            <Button type="submit" size="lg" fullWidth className="mt-4">
              Search Menu
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-2">
            {["Fresh", "Organic", "Sugar Free", "Combo"].map((term) => (
              <Button
                key={term}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(`/menu?search=${encodeURIComponent(term)}`)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
