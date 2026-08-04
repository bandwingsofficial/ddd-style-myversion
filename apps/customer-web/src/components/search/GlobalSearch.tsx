"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

import SearchSuggestionItem from "@/components/search/SearchSuggestionItem";
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
} from "@/features/search/search-history";
import {
  fetchTrendingProducts,
  getProductName,
  getProductSlug,
} from "@/features/search/search.api";
import {
  POPULAR_SEARCHES,
  SUGGESTION_LIMIT,
} from "@/features/search/search.types";
import { useProductSearch } from "@/features/search/useProductSearch";
import { ProductListItem } from "@/features/products/types/product.types";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  variant?: "header" | "page";
  initialQuery?: string;
  autoFocus?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export default function GlobalSearch({
  variant = "header",
  initialQuery = "",
  autoFocus = false,
  className,
  onNavigate,
}: GlobalSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [trending, setTrending] = useState<ProductListItem[]>([]);

  const trimmedQuery = query.trim();
  const { results, loading } = useProductSearch(trimmedQuery, {
    enabled: open && trimmedQuery.length > 0,
    limit: SUGGESTION_LIMIT,
  });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory());
      void fetchTrendingProducts(4).then(setTrending).catch(() => setTrending([]));
    }
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const navigateToResults = useCallback(
    (value: string) => {
      const next = value.trim();
      if (!next) return;

      addSearchHistory(next);
      setOpen(false);
      onNavigate?.();
      router.push(`/search?q=${encodeURIComponent(next)}`);
    },
    [router, onNavigate],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigateToResults(query);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = () => {
    setOpen(false);
    onNavigate?.();
  };

  const showSuggestionsPanel = open;
  const showTypedResults = trimmedQuery.length > 0;
  const showEmptyPanel = !showTypedResults;

  const inputClassName =
    variant === "header"
      ? "h-full w-full border-none bg-transparent pl-2.5 text-[0.92rem] font-medium text-slate-600 outline-none placeholder:text-slate-400"
      : "h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-base shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const formClassName =
    variant === "header"
      ? "group/search flex h-full w-full items-center rounded-2xl border border-transparent bg-slate-100 px-2 py-2 transition-all duration-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
      : "relative";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className={formClassName}>
        <Search
          size={variant === "header" ? 18 : 20}
          className={cn(
            variant === "header"
              ? "ml-2 shrink-0 text-slate-400 transition-transform duration-300 group-focus-within/search:scale-110 group-focus-within/search:text-green-500"
              : "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400",
          )}
        />

        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={showSuggestionsPanel}
          aria-controls={listboxId}
          className={inputClassName}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600",
              variant === "page" ? "absolute right-3 top-1/2 -translate-y-1/2" : "mr-1",
            )}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {showSuggestionsPanel && (
        <div
          id={listboxId}
          className={cn(
            "absolute left-0 right-0 z-[1200] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]",
            variant === "header" ? "top-[calc(100%+8px)]" : "top-[calc(100%+10px)]",
          )}
        >
          {showTypedResults ? (
            <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="py-1">
                  {results.map((product) => (
                    <SearchSuggestionItem
                      key={product.id}
                      product={product}
                      onSelect={handleSelectSuggestion}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No products found for &quot;{trimmedQuery}&quot;
                </div>
              )}

              {trimmedQuery && (
                <button
                  type="button"
                  onClick={() => navigateToResults(trimmedQuery)}
                  className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  View all results for &quot;{trimmedQuery}&quot;
                </button>
              )}
            </div>
          ) : (
            <div className="max-h-[min(24rem,70vh)] overflow-y-auto p-3">
              {history.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        clearSearchHistory();
                        setHistory([]);
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {history.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => navigateToResults(term)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Clock size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => navigateToResults(term)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {trending.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <TrendingUp size={14} />
                    Trending products
                  </p>
                  <div className="space-y-1">
                    {trending.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onNavigate?.();
                          router.push(`/products/${getProductSlug(product)}`);
                        }}
                        className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {getProductName(product)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
