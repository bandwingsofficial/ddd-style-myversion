"use client";

import { memo, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  name: string;
  mainImage: string;
  gallery: string[];
}

function ProductGalleryComponent({
  name,
  mainImage,
  gallery,
}: ProductGalleryProps) {
  const images = useMemo(() => {
    const unique = [mainImage, ...gallery].filter(Boolean);
    return [...new Set(unique)];
  }, [mainImage, gallery]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const activeImage = images[activeIndex] ?? mainImage;

  return (
    <div className="w-full min-w-0">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-surface-border bg-white">
        {!loadedImages[activeIndex] ? (
          <div className="absolute inset-0 animate-pulse bg-surface-unit" aria-hidden />
        ) : null}
        <img
          src={activeImage}
          alt={name}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "h-full w-full object-contain p-4 transition-opacity duration-200",
            loadedImages[activeIndex] ? "opacity-100" : "opacity-0",
          )}
          onLoad={() =>
            setLoadedImages((prev) => ({ ...prev, [activeIndex]: true }))
          }
        />
      </div>

      {images.length > 1 ? (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          aria-label="Product images"
        >
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              role="tab"
              onClick={() => setActiveIndex(idx)}
              aria-selected={activeIndex === idx}
              aria-label={`View image ${idx + 1}`}
              className={cn(
                "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                activeIndex === idx
                  ? "border-brand-dark ring-1 ring-brand-dark"
                  : "border-surface-border hover:border-ink-muted",
              )}
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const ProductGallery = memo(ProductGalleryComponent);
