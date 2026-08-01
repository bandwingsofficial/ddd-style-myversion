'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Layers,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Tag,
  Users,
  X,
} from 'lucide-react';

import {
  dashCard,
  dashListItem,
  dashSectionSubtitle,
  dashSectionTitle,
} from './dashboard-ui';

const QUICK_ACTIONS = [
  { label: 'Create Product', href: '/products', icon: Package },
  { label: 'Create Category', href: '/categories', icon: Layers },
  { label: 'Create Coupon', href: '/settings', icon: Tag },
  { label: 'Create Outlet', href: '/outlets', icon: Store },
  { label: 'View Orders', href: '/orders', icon: ShoppingBag },
  { label: 'View Payments', href: '/payments', icon: CreditCard },
  { label: 'Manage Customers', href: '/users', icon: Users },
] as const;

function ActionLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 ${dashListItem} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]/30`}
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#16A34A]">
            <action.icon size={16} strokeWidth={2} />
          </span>
          <span className="truncate">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}

/** Inline dashboard widget — desktop & tablet */
export function QuickActionsCard() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`${dashCard} hidden overflow-hidden md:block`}>
      <div className="flex items-center justify-between border-b border-[#D8F3E4]/70 px-5 py-4 lg:hidden">
        <div>
          <h3 className={dashSectionTitle}>Quick Actions</h3>
          <p className={dashSectionSubtitle}>Common admin shortcuts</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-[14px] border border-[#D8F3E4] bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition duration-200 hover:border-[#86EFAC] hover:bg-[#ECFDF3] hover:text-[#15803D]"
          aria-expanded={expanded}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="hidden px-5 pb-5 pt-4 lg:block">
        <h3 className={dashSectionTitle}>Quick Actions</h3>
        <p className={`${dashSectionSubtitle} mb-4`}>Common admin shortcuts</p>
        <ActionLinks />
      </div>

      {expanded && (
        <div className="border-t border-[#D8F3E4]/70 px-5 pb-5 pt-4 lg:hidden">
          <ActionLinks />
        </div>
      )}
    </div>
  );
}

/** Mobile FAB + bottom sheet — never permanently open */
export function QuickActionsFab() {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusable?.[0]?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      fabRef.current?.focus();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-[0_8px_24px_rgba(16,185,129,0.28)] transition duration-200 hover:bg-[#22C55E] hover:scale-105 active:scale-95 md:hidden"
        aria-label="Open quick actions"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close quick actions"
            className="absolute inset-0 animate-in fade-in bg-slate-900/40 duration-200"
            onClick={close}
          />

          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-actions-title"
            className={`${dashCard} absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between border-b border-[#D8F3E4]/70 px-5 py-4">
              <div>
                <h2 id="quick-actions-title" className={dashSectionTitle}>
                  Quick Actions
                </h2>
                <p className={dashSectionSubtitle}>Common admin shortcuts</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8F3E4] bg-white text-slate-500 transition duration-200 hover:border-[#86EFAC] hover:bg-[#ECFDF3]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(85vh-4.5rem)] overflow-y-auto px-5 py-4">
              <ActionLinks onNavigate={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
