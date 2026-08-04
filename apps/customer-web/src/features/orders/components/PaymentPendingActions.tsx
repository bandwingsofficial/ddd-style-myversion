"use client";

import Link from "next/link";
import { Home, Loader2 } from "lucide-react";

interface PaymentPendingActionsProps {
  paying?: boolean;
  cancelling?: boolean;
  onPayNow: () => void;
  onCancelClick: () => void;
  /** `details` = order details page (no View Details). `pay` = dedicated pay page. */
  variant?: "details" | "pay";
  orderId?: string;
  detailsHref?: string;
  detailsLabel?: string;
}

const BTN_BASE =
  "inline-flex h-[42px] items-center justify-center rounded-[10px] px-5 text-base font-medium transition disabled:opacity-50";

export default function PaymentPendingActions({
  paying = false,
  cancelling = false,
  onPayNow,
  onCancelClick,
  variant = "details",
  orderId,
  detailsHref,
  detailsLabel = "View details",
}: PaymentPendingActionsProps) {
  const resolvedDetailsHref = detailsHref ?? `/orders/${orderId}`;

  if (variant === "pay") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={onPayNow}
          disabled={paying || cancelling}
          className={`${BTN_BASE} bg-[#00A300] text-white hover:bg-[#009000]`}
        >
          {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Pay now
        </button>

        <button
          type="button"
          onClick={onCancelClick}
          disabled={paying || cancelling}
          className={`${BTN_BASE} border border-[#DC2626] bg-white text-[#DC2626] hover:bg-red-50`}
        >
          {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Cancel order
        </button>

        <Link
          href="/home"
          className={`${BTN_BASE} border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50`}
        >
          <Home size={16} className="mr-1.5" />
          Back home
        </Link>

        <Link
          href={resolvedDetailsHref}
          className={`${BTN_BASE} border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50`}
        >
          {detailsLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-center">
      <button
        type="button"
        onClick={onPayNow}
        disabled={paying || cancelling}
        className={`${BTN_BASE} bg-[#00A300] text-white hover:bg-[#009000] lg:min-w-[140px]`}
      >
        {paying ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        Pay now
      </button>

      <button
        type="button"
        onClick={onCancelClick}
        disabled={paying || cancelling}
        className={`${BTN_BASE} border border-[#DC2626] bg-white text-[#DC2626] hover:bg-red-50 lg:min-w-[140px]`}
      >
        {cancelling ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        Cancel order
      </button>

      <Link
        href="/home"
        className={`${BTN_BASE} col-span-2 border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 lg:col-span-1 lg:min-w-[140px]`}
      >
        <Home size={16} className="mr-1.5" />
        Back home
      </Link>
    </div>
  );
}
