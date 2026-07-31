"use client";

import { TicketPercent } from "lucide-react";
import { DeliveryFeeDisplay } from "@/features/delivery/DeliveryFeeDisplay";

export interface OrderSummaryBreakdownProps {
  subtotal: number;
  discount: number;
  netSubtotal: number;
  deliveryFee: number;
  grandTotal: number;
  remainingForFreeDelivery?: number | null;
  showFreeDeliveryHint?: boolean;
  discountLabel?: string;
  netSubtotalLabel?: string;
  totalLabel?: string;
  className?: string;
  totalClassName?: string;
}

export function OrderSummaryBreakdown({
  subtotal,
  discount,
  netSubtotal,
  deliveryFee,
  grandTotal,
  remainingForFreeDelivery,
  showFreeDeliveryHint = true,
  discountLabel = "Product Discount",
  netSubtotalLabel = "Net Subtotal",
  totalLabel = "Grand Total",
  className = "space-y-3 text-sm text-slate-600",
  totalClassName = "flex justify-between items-center py-4 font-extrabold text-xl text-slate-900",
}: OrderSummaryBreakdownProps) {
  return (
    <>
      <div className={className}>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1">
              <TicketPercent size={14} />
              {discountLabel}
            </span>
            <span>- ₹{discount}</span>
          </div>
        )}

        <div className="flex justify-between font-medium text-slate-800">
          <span>{netSubtotalLabel}</span>
          <span>₹{netSubtotal}</span>
        </div>

        <DeliveryFeeDisplay
          deliveryFee={deliveryFee}
          remainingForFreeDelivery={
            showFreeDeliveryHint ? remainingForFreeDelivery : null
          }
        />
      </div>

      <div className={totalClassName}>
        <span>{totalLabel}</span>
        <span>₹{grandTotal}</span>
      </div>
    </>
  );
}
