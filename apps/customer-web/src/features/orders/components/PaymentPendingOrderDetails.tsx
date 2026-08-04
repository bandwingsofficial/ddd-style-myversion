"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { AlertTriangle, Clock, CreditCard, Headphones, MapPin, ShieldCheck } from "lucide-react";

import { OrderDetails } from "@/features/checkout/checkout.types";
import { usePaymentTimer } from "@/features/checkout/usePaymentTimer";
import { formatDateTimeIST, formatTimeIST } from "@/lib/format-datetime";
import { getProductImageUrl } from "@/lib/image-url";
import { OrderSummaryBreakdown } from "@/features/orders/components/OrderSummaryBreakdown";

import PaymentPendingActions from "./PaymentPendingActions";

const CARD =
  "rounded-xl border border-[#E5E7EB] bg-white p-6";

interface PaymentPendingOrderDetailsProps {
  order: OrderDetails;
  paying?: boolean;
  cancelling?: boolean;
  onPayNow: () => void;
  onCancelClick: () => void;
}

function SidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={CARD}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-base">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function PaymentPendingOrderDetails({
  order,
  paying = false,
  cancelling = false,
  onPayNow,
  onCancelClick,
}: PaymentPendingOrderDetailsProps) {
  const { formatted, colorClass, pulseLastMinute, isExpired } = usePaymentTimer(
    order.paymentExpiresAt,
    order.remainingSeconds,
  );

  const expiresAtLabel = order.paymentExpiresAt
    ? formatTimeIST(order.paymentExpiresAt)
    : null;

  if (isExpired) {
    return null;
  }

  const placedOn = formatDateTimeIST(order.createdAt, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      {/* LEFT — 70% */}
      <div className="space-y-8">
        {/* Header: order number + timer */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Order Number</p>
            <h1 className="mt-1 text-[32px] font-bold leading-tight text-slate-900">
              #{order.orderNumber}
            </h1>
          </div>

          <div
            className={`w-full shrink-0 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4 sm:w-auto sm:min-w-[200px] ${pulseLastMinute ? "animate-pulse" : ""}`}
          >
            <p className="text-sm text-slate-500">Time remaining</p>
            <p
              className={`mt-1 font-mono text-[32px] font-bold tabular-nums leading-none ${colorClass}`}
            >
              {formatted}
            </p>
            {expiresAtLabel ? (
              <p className="mt-2 text-sm text-slate-500">
                Order expires at {expiresAtLabel}
              </p>
            ) : null}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-4 rounded-xl border border-amber-200/80 bg-amber-50 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle size={20} className="text-[#F59E0B]" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-amber-950">
              Waiting for payment
            </p>
            <p className="mt-0.5 text-sm leading-snug text-amber-900/80">
              Complete payment before the countdown finishes. After expiry this
              order will automatically cancel.
            </p>
          </div>
        </div>

        {/* Order items */}
        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-slate-900">
              Order Items
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={
                      getProductImageUrl(item.productImage) ??
                      "/images/product-placeholder.png"
                    }
                    alt={item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">
                        {item.productName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Qty {item.quantity}
                        {item.discountPrice > 0 && item.discountPrice < item.unitPrice
                          ? ` · ₹${item.discountPrice} each`
                          : ` · ₹${item.unitPrice} each`}
                      </p>
                    </div>
                    <p className="shrink-0 text-base font-semibold text-slate-900">
                      ₹{Number(item.totalPrice).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(order.orderNotes || order.deliveryInstructions) && (
            <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {order.orderNotes ? (
                <p>
                  <span className="font-medium text-slate-700">Note: </span>
                  {order.orderNotes}
                </p>
              ) : null}
              {order.deliveryInstructions ? (
                <p className={order.orderNotes ? "mt-1" : ""}>
                  <span className="font-medium text-slate-700">Instructions: </span>
                  {order.deliveryInstructions}
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4">
            <span className="text-base font-semibold text-slate-900">
              Order Total
            </span>
            <span className="text-[22px] font-bold text-slate-900">
              ₹{Number(order.grandTotal).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div>
          <PaymentPendingActions
            variant="details"
            paying={paying}
            cancelling={cancelling}
            onPayNow={onPayNow}
            onCancelClick={onCancelClick}
          />

          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <ShieldCheck size={14} className="shrink-0" />
            Your payment is protected with SSL encryption.
          </p>
        </div>
      </div>

      {/* RIGHT — 30% */}
      <div className="space-y-8">
        <SidebarCard
          title="Payment Summary"
          icon={<CreditCard size={18} className="text-slate-500" />}
        >
          <OrderSummaryBreakdown
            subtotal={order.subtotal}
            discount={order.discount}
            netSubtotal={order.netSubtotal ?? order.afterDiscountTotal}
            deliveryFee={order.deliveryFee}
            grandTotal={order.grandTotal}
            showFreeDeliveryHint={false}
            className="space-y-3 text-base text-slate-600"
            totalClassName="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-base font-semibold text-slate-900"
            totalLabel="Grand Total"
          />
        </SidebarCard>

        <SidebarCard
          title="Delivery Address"
          icon={<MapPin size={18} className="text-slate-500" />}
        >
          <p className="text-base font-semibold text-slate-900">
            {order.address.label}
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {order.address.addressText}
          </p>
        </SidebarCard>

        <SidebarCard
          title="Order Information"
          icon={<Clock size={18} className="text-slate-500" />}
        >
          <div className="divide-y divide-[#E5E7EB]">
            <InfoRow label="Placed On" value={placedOn} />
            <InfoRow label="Payment Method" value="Online (Razorpay)" />
            <InfoRow
              label="Order Status"
              value={order.displayStatus ?? "Payment Pending"}
            />
            <InfoRow
              label="Payment Status"
              value={order.paymentStatus ?? "PENDING"}
            />
          </div>
        </SidebarCard>

        <SidebarCard
          title="Need Help?"
          icon={<Headphones size={18} className="text-slate-500" />}
        >
          <p className="text-base text-slate-600">
            Contact our support team for payment or order issues.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href="mailto:cantenonline@gmail.com"
              className="block font-medium text-slate-700 hover:text-[#00A300]"
            >
              cantenonline@gmail.com
            </a>
            <a
              href="tel:+919902962777"
              className="block font-medium text-slate-700 hover:text-[#00A300]"
            >
              +91 99029 62777
            </a>
          </div>
        </SidebarCard>
      </div>
    </div>
  );
}
