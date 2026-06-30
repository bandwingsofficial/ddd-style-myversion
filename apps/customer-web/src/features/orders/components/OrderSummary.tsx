"use client";

import {
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";

import { OrderDetails } from "@/features/checkout/checkout.types";

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

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span className="font-semibold">
              ₹{order.subtotal}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                Discount
              </span>

              <span className="font-semibold text-green-600">
                -₹{order.discount}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              Delivery Fee
            </span>

            <span className="font-semibold">
              {order.deliveryFee === 0
                ? "FREE"
                : `₹${order.deliveryFee}`}
            </span>
          </div>

          <hr />

          <div className="flex justify-between">
            <span className="text-base font-bold">
              Grand Total
            </span>

            <span className="text-2xl font-bold text-emerald-600">
              ₹{order.grandTotal}
            </span>
          </div>
        </div>
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

          {new Date(
            order.createdAt,
          ).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}