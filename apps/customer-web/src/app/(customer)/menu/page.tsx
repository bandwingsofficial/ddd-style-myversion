"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { resolveProductPricing } from "@/lib/product-pricing";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { useDeliveryAppState } from "@/features/location/hooks/useDeliveryAppState";
import NoDeliveryState from "@/components/location/NoDeliveryState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { typography, productGrid } from "@/lib/design-tokens";
import CategoryFilterBar from "@/features/categories/components/CategoryFilterBar";
import { useMenuCategoryFilter } from "@/features/categories/hooks/useMenuCategoryFilter";
import { Category } from "@/features/categories/types";

function MenuPageContent() {
  const searchParams = useSearchParams();
  const { products, loading, error, refresh } = useProducts();
  const {
    isNoOutlet,
    needsLocation,
    isResolving,
    showShimmer,
    selectedOutlet,
  } = useDeliveryAppState();

  const {
    categories,
    categoriesLoading,
    activeCategory,
    categoryId,
    setCategory,
    clearCategory,
  } = useMenuCategoryFilter();

  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filterOptions = ["Organic", "Fresh", "Natural"];

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const name = (product.name?.value || product.name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());

      const { sellingPrice } = resolveProductPricing(product);
      const matchesPrice = sellingPrice <= maxPrice;

      const productTags = (product.tags || []).map((t: string) =>
        t.toLowerCase(),
      );
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => productTags.includes(tag.toLowerCase()));

      const matchesCategory =
        !categoryId || product.category?.id === categoryId;

      return matchesSearch && matchesPrice && matchesTags && matchesCategory;
    });
  }, [products, searchQuery, maxPrice, selectedTags, categoryId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMaxPrice(500);
    setSelectedTags([]);
    clearCategory();
  };

  const handleCategorySelect = (category: Category | null) => {
    if (category) {
      setCategory(category);
    } else {
      clearCategory();
    }
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    selectedTags.length +
    (categoryId ? 1 : 0);

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Max Price: ₹{maxPrice}
        </label>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseInt(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`touch-target rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                selectedTags.includes(tag)
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => {
            clearFilters();
            setFilterSheetOpen(false);
          }}
          className="flex w-full items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 touch-target"
        >
          <X size={16} /> Clear all filters
        </button>
      )}
    </div>
  );

  const showCategoryEmptyState =
    !loading &&
    !error &&
    !!selectedOutlet &&
    !!activeCategory &&
    filteredProducts.length === 0;

  const showGeneralEmptyState =
    !loading &&
    !error &&
    !!selectedOutlet &&
    !activeCategory &&
    filteredProducts.length === 0 &&
    activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="customer-page-shell mt-4 customer-page-shell--with-cart">
        <section className="mobile-container">
          <Breadcrumbs
            items={
              activeCategory
                ? [
                    { label: "Menu", href: "/menu" },
                    { label: activeCategory.name },
                  ]
                : [{ label: "Menu" }]
            }
          />

          <header className="mb-6 border-b border-slate-100 pb-4 sm:mb-8 sm:pb-6">
            <h1 className={`${typography.pageTitle} mb-4 sm:mb-6`}>
              {activeCategory ? activeCategory.name : "Our Products"}
            </h1>

            {activeCategory && (
              <div className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Category
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeCategory.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Showing {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearCategory}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 touch-target"
                >
                  Clear filter
                </button>
              </div>
            )}

            <div className="mb-4">
              <CategoryFilterBar
                categories={categories}
                activeCategoryId={categoryId}
                onSelect={handleCategorySelect}
                loading={categoriesLoading}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="search"
                  enterKeyHint="search"
                  placeholder="Search fresh products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm lg:hidden touch-target"
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="mt-4 hidden flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-[200px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
                  <span className="whitespace-nowrap text-xs font-bold text-slate-500">
                    Max Price: ₹{maxPrice}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {filterOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                        selectedTags.includes(tag)
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-500"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 text-xs font-bold text-red-500 hover:text-red-600"
                  >
                    <X size={14} /> Reset
                  </button>
                )}
              </div>
            </div>
          </header>

          {showShimmer || isResolving ? (
            <div className={productGrid.cols}>
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : isNoOutlet || needsLocation ? (
            <NoDeliveryState
              title={
                needsLocation
                  ? "Choose your delivery location"
                  : undefined
              }
              description={
                needsLocation
                  ? "Select where you want your order delivered to browse products and checkout."
                  : undefined
              }
            />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 touch-target"
              >
                Retry
              </button>
            </div>
          ) : showCategoryEmptyState ? (
            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <div className="mb-4 rounded-full bg-slate-50 p-6">
                <Filter size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No products found in this category
              </h3>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                We don&apos;t have any items in {activeCategory?.name} right now.
                Browse our full menu instead.
              </p>
              <Link
                href="/menu"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700 touch-target"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className={productGrid.cols}>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))
                : filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          )}

          {showGeneralEmptyState && (
            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <div className="mb-4 rounded-full bg-slate-50 p-6">
                <Filter size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No products found
              </h3>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                We couldn&apos;t find any products matching your current filters.
                Try adjusting your search or price range.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 text-sm font-bold text-emerald-600 underline underline-offset-4 touch-target"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Products"
      >
        {filterPanel}
      </BottomSheet>

      <Footer />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        </div>
      }
    >
      <MenuPageContent />
    </Suspense>
  );
}
