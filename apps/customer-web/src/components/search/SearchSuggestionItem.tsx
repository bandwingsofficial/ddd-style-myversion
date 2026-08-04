"use client";

import Link from "next/link";
import Image from "next/image";

import { ProductListItem } from "@/features/products/types/product.types";
import { getProductImageUrl } from "@/lib/image-url";
import { resolveProductPricing } from "@/lib/product-pricing";
import {
  getProductName,
  getProductSlug,
} from "@/features/search/search.api";

interface SearchSuggestionItemProps {
  product: ProductListItem;
  onSelect: () => void;
}

export default function SearchSuggestionItem({
  product,
  onSelect,
}: SearchSuggestionItemProps) {
  const name = getProductName(product);
  const slug = getProductSlug(product);
  const categoryName = product.category?.name ?? "Product";
  const { sellingPrice } = resolveProductPricing(product as any);
  const imageUrl =
    getProductImageUrl(
      product.images?.mainImageUrl ??
        (product.images as { mainImage?: string } | undefined)?.mainImage,
    ) ?? "/images/product-placeholder.png";

  const available = product.status !== "INACTIVE";

  return (
    <Link
      href={`/products/${slug}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-emerald-50/70"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{categoryName}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-slate-900">₹{sellingPrice}</p>
        <p
          className={`text-[11px] font-medium ${
            available ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </p>
      </div>
    </Link>
  );
}
