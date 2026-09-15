"use client";

import { memo, useMemo, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductGalleryMediaItem } from "@/features/products/types/product.types";

interface ProductGalleryProps {
  name: string;
  mainImage: string;
  gallery: ProductGalleryMediaItem[];
}

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function ProductGalleryComponent({
  name,
  mainImage,
  gallery,
}: ProductGalleryProps) {
  const mediaItems = useMemo(() => {
    const items: ProductGalleryMediaItem[] = [
      { url: mainImage, type: "image" },
      ...gallery.filter((item) => item.url && item.url !== mainImage),
    ];

    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.url)) {
        return false;
      }

      seen.add(item.url);
      return true;
    });
  }, [mainImage, gallery]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const activeItem = mediaItems[activeIndex] ?? mediaItems[0];
  const activeIsVideo = activeItem?.type === "video";

  return (
    <div className="w-full min-w-0">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-surface-border bg-white">
        {!activeIsVideo && !loadedImages[activeIndex] ? (
          <div
            className="absolute inset-0 animate-pulse bg-surface-unit"
            aria-hidden
          />
        ) : null}

        {activeIsVideo ? (
          <video
            key={activeItem.url}
            src={activeItem.url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <img
            src={activeItem?.url ?? mainImage}
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
        )}
      </div>

      {mediaItems.length > 1 ? (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          aria-label="Product media"
        >
          {mediaItems.map((item, idx) => (
            <button
              key={`${item.url}-${idx}`}
              type="button"
              role="tab"
              onClick={() => setActiveIndex(idx)}
              aria-selected={activeIndex === idx}
              aria-label={
                item.type === "video"
                  ? `View video ${idx + 1}`
                  : `View image ${idx + 1}`
              }
              className={cn(
                "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                activeIndex === idx
                  ? "border-brand-dark ring-1 ring-brand-dark"
                  : "border-surface-border hover:border-ink-muted",
              )}
            >
              {item.type === "video" ? (
                <>
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-white">
                    <Play size={14} fill="currentColor" />
                    {formatDuration(item.durationSeconds) ? (
                      <span className="mt-0.5 text-[9px] font-semibold">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain p-1"
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const ProductGallery = memo(ProductGalleryComponent);
