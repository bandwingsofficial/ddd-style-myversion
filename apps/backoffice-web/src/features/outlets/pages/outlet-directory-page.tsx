'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react';

import { useOutlets } from '@/features/outlets/hooks/use-outlets';

const PAGE_SIZE = 12;

export default function OutletDirectoryPage() {
  const router = useRouter();
  const { allItems, loading, error, search, setSearch, refresh } = useOutlets();
  const [page, setPage] = useState(1);

  const filteredOutlets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return allItems;
    }

    return allItems.filter(
      (outlet) =>
        outlet.name.toLowerCase().includes(query) ||
        (outlet.branch?.toLowerCase().includes(query) ?? false) ||
        (outlet.address?.toLowerCase().includes(query) ?? false),
    );
  }, [allItems, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOutlets.length / PAGE_SIZE));
  const paginatedOutlets = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOutlets.slice(start, start + PAGE_SIZE);
  }, [filteredOutlets, page, totalPages]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Outlet Directory
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage stock, products, and users for each outlet location.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or branch..."
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-3 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedOutlets.map((outlet) => (
            <div
              key={outlet.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-foreground">
                    {outlet.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} />
                    {outlet.branch ?? 'Main Branch'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/users/${outlet.id}/stock`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Package size={14} />
                  Stock
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/users/${outlet.id}/products`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <ShoppingBag size={14} />
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/users/${outlet.id}`)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex-none"
                >
                  <Users size={14} />
                  Users
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOutlets.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Store size={36} className="text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              {search ? 'No outlets match your search.' : 'No outlets found.'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
