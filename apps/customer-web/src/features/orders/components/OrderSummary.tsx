"use client";

import {
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";

import { formatDateTimeIST } from "@/lib/format-datetime";

import { OrderDetails } from "@/features/checkout/checkout.types";
import { OrderSummaryBreakdown } from "@/features/orders/components/OrderSummaryBreakdown";

interface OrderSummaryProps {
  order: OrderDetails;
}

export default function OrderSummary({
  order,
}: OrderSummaryProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
          <CreditCard size={20} />
          Payment Summary
        </h2>

        <OrderSummaryBreakdown
          subtotal={order.subtotal}
          discount={order.discount}
          netSubtotal={order.netSubtotal ?? order.afterDiscountTotal}
          deliveryFee={order.deliveryFee}
          grandTotal={order.grandTotal}
          showFreeDeliveryHint={false}
          className="space-y-4 text-sm"
          totalClassName="flex justify-between border-t border-slate-100 pt-4"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
          <MapPin size={20} />
          Delivery Address
        </h2>

        <p className="font-semibold">
          {order.address.label}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {order.address.addressText}
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} />

          {formatDateTimeIST(order.createdAt, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      </div>
    </div>
  );
}
