"use client";

import { Clock } from "lucide-react";

import { OrderDetails } from "@/features/checkout/checkout.types";
import { usePaymentTimer } from "@/features/checkout/usePaymentTimer";
import { formatTimeIST } from "@/lib/format-datetime";

import PaymentPendingActions from "./PaymentPendingActions";

interface PaymentPendingSectionProps {
  order: OrderDetails;
  paying?: boolean;
  cancelling?: boolean;
  onPayNow: () => void;
  onCancelClick: () => void;
  detailsHref?: string;
  detailsLabel?: string;
}

/** Compact pending block for the dedicated /pay page */
export default function PaymentPendingSection({
  order,
  paying = false,
  cancelling = false,
  onPayNow,
  onCancelClick,
  detailsHref,
  detailsLabel,
}: PaymentPendingSectionProps) {
  const {
    formatted,
    colorClass,
    pulseLastMinute,
    isExpired,
  } = usePaymentTimer(order.paymentExpiresAt, order.remainingSeconds);

  const expiresAtLabel = order.paymentExpiresAt
    ? formatTimeIST(order.paymentExpiresAt)
    : null;

  if (isExpired) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-amber-200/80 bg-amber-50 px-5 py-4">
        <Clock size={20} className="shrink-0 text-[#F59E0B]" />
        <div>
          <p className="text-base font-semibold text-amber-950">
            Waiting for payment
          </p>
          <p className="mt-0.5 text-sm text-amber-900/80">
            Complete payment before the countdown finishes.
          </p>
        </div>
      </div>

      <div
        className={`rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4 text-center ${pulseLastMinute ? "animate-pulse" : ""}`}
      >
        <p className="text-sm text-slate-500">Time remaining</p>
        <p
          className={`mt-1 font-mono text-3xl font-bold tabular-nums ${colorClass}`}
        >
          {formatted}
        </p>
        {expiresAtLabel ? (
          <p className="mt-2 text-sm text-slate-500">
            Order expires at {expiresAtLabel}
          </p>
        ) : null}
      </div>

      <PaymentPendingActions
        variant="pay"
        orderId={order.id}
        paying={paying}
        cancelling={cancelling}
        onPayNow={onPayNow}
        onCancelClick={onCancelClick}
        detailsHref={detailsHref}
        detailsLabel={detailsLabel}
      />
    </div>
  );
}
