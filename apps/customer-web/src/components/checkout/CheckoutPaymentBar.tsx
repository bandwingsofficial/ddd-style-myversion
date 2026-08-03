"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, ShieldCheck } from "lucide-react";

export interface CheckoutPaymentBarProps {
  grandTotal: number | null;
  onPay: () => void;
  disabled: boolean;
  showSpinner: boolean;
  checkoutOpen: boolean;
  blockReason?: string | null;
  preparingLabel?: string;
  actionLabel?: string;
}

export function CheckoutPaymentBar({
  grandTotal,
  onPay,
  disabled,
  showSpinner,
  checkoutOpen,
  blockReason,
  preparingLabel = "Preparing checkout...",
  actionLabel,
}: CheckoutPaymentBarProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const label =
    actionLabel ??
    (showSpinner
      ? preparingLabel
      : checkoutOpen
        ? "Payment Window Open"
        : grandTotal != null
          ? `Pay ₹${grandTotal}`
          : "Proceed to Payment");

  const bar = (
    <div
      className="fixed inset-x-0 bottom-0 z-[950] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-lg"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      data-testid="checkout-payment-bar"
      role="region"
      aria-label="Checkout payment"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2">
        {blockReason ? (
          <p className="text-xs font-medium text-amber-900">{blockReason}</p>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Payable
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {grandTotal != null ? `₹${grandTotal}` : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onPay}
            disabled={disabled}
            aria-disabled={disabled}
            className="flex min-h-[2.75rem] flex-1 max-w-[260px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg touch-target disabled:cursor-not-allowed disabled:opacity-70"
            data-testid="checkout-payment-button"
          >
            {showSpinner ? (
              <Loader2 className="animate-spin" size={18} aria-hidden />
            ) : (
              <ShieldCheck size={18} aria-hidden />
            )}
            <span>{label}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!portalTarget) {
    return bar;
  }

  return createPortal(bar, portalTarget);
}
