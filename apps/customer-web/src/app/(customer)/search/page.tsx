"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Loader2, Search } from "lucide-react";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import GlobalSearch from "@/components/search/GlobalSearch";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { typography, productGrid } from "@/lib/design-tokens";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { ProductListItem } from "@/features/products/types/product.types";
import { addSearchHistory } from "@/features/search/search-history";
import { searchProducts } from "@/features/search/search.api";
import {
  ProductSearchSort,
  SEARCH_RESULTS_LIMIT,
} from "@/features/search/search.types";

const SORT_OPTIONS: { value: ProductSearchSort; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const categoryParam = searchParams.get("categoryId") ?? "";
  const selectedOutletId = useOutletStore((s) => s.selectedOutlet?.id);

  const [sort, setSort] = useState<ProductSearchSort>("popularity");
  const [categoryId, setCategoryId] = useState(categoryParam);
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const { categories } = useCategories();

  useEffect(() => {
    setCategoryId(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (query) {
      addSearchHistory(query);
    }
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void searchProducts(
      {
        q: query,
        outletId: selectedOutletId,
        categoryId: categoryId || undefined,
        sort,
        page: 1,
        limit: SEARCH_RESULTS_LIMIT,
      },
      controller.signal,
    )
      .then((response) => {
        setResults(response.items);
        setTotal(response.total);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResults([]);
        setTotal(0);
        setError("Could not search products. Please try again.");
        console.error("Search results failed", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, categoryId, sort, selectedOutletId]);

  const resultLabel = useMemo(() => {
    if (!query) return "";
    const count = total || results.length;
    return `${count} ${count === 1 ? "product" : "products"}`;
  }, [total, query, results.length]);

  const updateCategoryFilter = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategoryId) {
      params.set("categoryId", nextCategoryId);
    } else {
      params.delete("categoryId");
    }
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="customer-page-shell customer-page-shell--with-cart">
        <section className="mobile-container">
          <Breadcrumbs
            items={[
              {
                label: "Search",
                href: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
              },
              ...(query ? [{ label: `"${query}"` }] : []),
            ]}
          />

          <div className="mx-auto max-w-3xl">
            <GlobalSearch variant="page" initialQuery={query} autoFocus={!query} />
          </div>

          {query ? (
            <>
              <header className="mb-6 mt-8 border-b border-slate-100 pb-5">
                <h1 className={typography.pageTitle}>Search Results</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Showing {resultLabel} for{" "}
                  <span className="font-semibold text-slate-900">
                    &quot;{query}&quot;
                  </span>
                </p>

                <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as ProductSearchSort)
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={categoryId}
                    onChange={(event) => updateCategoryFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </header>

              {loading ? (
                <div className={productGrid.cols}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                  {error}
                </div>
              ) : results.length > 0 ? (
                <div className={productGrid.cols}>
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-white p-6 shadow-sm">
                    <Search size={40} className="text-slate-300" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    No products found for &quot;{query}&quot;
                  </h2>
                  <ul className="mt-4 space-y-1 text-sm text-slate-500">
                    <li>Check spelling</li>
                    <li>Try another keyword</li>
                  </ul>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/category"
                      className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Browse categories
                    </Link>
                    <Link
                      href="/menu"
                      className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Browse menu
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
              <Search size={36} className="mx-auto text-slate-300" />
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Search our fresh products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try sugarcane, coconut, lemon, or browse popular searches above.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
