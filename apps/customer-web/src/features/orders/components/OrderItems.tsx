"use client";

import Image from "next/image";

import { OrderItem } from "../types/order.types";

interface OrderItemsProps {
  items: OrderItem[];
}

const BACKEND_URL = "https://api.dev.local:4000";

const getImageUrl = (path?: string) => {
  if (!path) return "/images/product-placeholder.png";

  if (path.startsWith("http")) {
    return path;
  }

  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function OrderItems({
  items,
}: OrderItemsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Order Items
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {items.length} Items
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={getImageUrl(item.productImage)}
                alt={item.productName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                {item.productName}
              </h3>

              <div className="mt-2 flex gap-4 text-sm text-slate-500">
                <span>Qty : {item.quantity}</span>

                <span>₹{item.unitPrice}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">
                ₹{item.totalPrice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}