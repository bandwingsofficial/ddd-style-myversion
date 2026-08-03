"use client";

import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { useCategoryProducts } from "../hooks/useCategoryProducts";
import { ShoppingBag, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { typography, productGrid } from "@/lib/design-tokens";

interface Props {
  categoryId: string;
}

export default function CategoryProductsPage({ categoryId }: Props) {
  const {
    products,
    categoryName,
    loading,
    isOutletSelected,
  } = useCategoryProducts(categoryId);

  if (!isOutletSelected) {
    return (
      <>
        <Breadcrumbs items={[{ label: categoryName || "Category" }]} />
        <EmptyState
          icon={<Store size={40} className="text-slate-400" />}
          title="Select a delivery location"
          description="Choose your delivery location to browse fresh items from your nearest store."
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner label="Loading products..." />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <Breadcrumbs
        items={[
          { label: "Categories", href: "/category" },
          { label: categoryName || "Category" },
        ]}
      />

      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className={typography.pageTitle}>
          {categoryName}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {products.length}{" "}
          {products.length === 1 ? "product available" : "products available"}
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={40} className="text-slate-300" />}
          title="No products found"
          description="We don't have items stocked in this collection right now."
          primaryAction={{
            label: "Browse Menu",
            onClick: () => {
              window.location.href = "/menu";
            },
            variant: "outline",
          }}
        />
      ) : (
        <div className={productGrid.cols}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
