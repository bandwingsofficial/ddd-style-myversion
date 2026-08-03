"use client";

import { memo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { typography } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface ProductDetailAccordionProps {
  ingredients?: string | null;
  benefits?: string | null;
  nutrition?: string | null;
}

function ProductDetailAccordionComponent({
  ingredients,
  benefits,
  nutrition,
}: ProductDetailAccordionProps) {
  const items: AccordionItem[] = [
    ingredients ? { id: "ingredients", title: "Ingredients", content: ingredients } : null,
    benefits ? { id: "benefits", title: "Benefits", content: benefits } : null,
    nutrition ? { id: "nutrition", title: "Nutrition", content: nutrition } : null,
  ].filter(Boolean) as AccordionItem[];

  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) return null;

  return (
    <div className="divide-y divide-surface-border rounded-card border border-surface-border bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              id={`accordion-${item.id}`}
              aria-expanded={isOpen}
              aria-controls={`panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-ink-primary transition-colors hover:bg-surface-unit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand touch-target"
            >
              {item.title}
              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 text-ink-muted transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-${item.id}`}
              hidden={!isOpen}
              className={cn("px-4 pb-4", isOpen ? "block" : "hidden")}
            >
              <p className={typography.body}>{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const ProductDetailAccordion = memo(ProductDetailAccordionComponent);
