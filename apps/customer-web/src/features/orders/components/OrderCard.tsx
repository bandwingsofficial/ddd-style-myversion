"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateIST } from "@/lib/format-datetime";
import {
  ArrowRight,
  Calendar,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { OrderDetails } from "@/features/checkout/checkout.types";
import { usePaymentTimer } from "@/features/checkout/usePaymentTimer";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import CancelUnpaidOrderModal from "@/features/orders/components/CancelUnpaidOrderModal";
import {
  getOrderStatusBadge,
  isPendingPayment,
} from "@/features/orders/order-status.util";

interface OrderCardProps {
  order: OrderDetails;
}

function PendingTimer({ order }: { order: OrderDetails }) {
  const { formatted, colorClass, isExpired } = usePaymentTimer(
    order.paymentExpiresAt,
    order.remainingSeconds,
  );

  if (!isPendingPayment(order) || isExpired) return null;

  return (
    <span className={`font-mono text-xs font-semibold tabular-nums ${colorClass}`}>
      {formatted} left
    </span>
  );
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const badge = getOrderStatusBadge(order);
  const pending = isPendingPayment(order);
  const href = pending ? `/orders/${order.id}/pay` : `/orders/${order.id}`;

  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await CheckoutApi.cancelOrder(order.id);
      toast.success("Order cancelled.");
      setShowCancelModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not cancel.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPaying(true);
    router.push(`/orders/${order.id}/pay`);
  };

  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-200/80 transition hover:ring-slate-300">
      <Link href={href} className="group block p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-900">
              #{order.orderNumber}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${badge.className}`}
            >
              {badge.label}
            </span>
            <PendingTimer order={order} />
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-4 sm:border-none sm:pt-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-50 p-2 text-slate-500">
                  <Package size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Items
                  </p>
                  <p className="text-sm font-medium text-slate-800">{order.itemCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-50 p-2 text-slate-500">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Ordered
                  </p>
                  <p className="text-sm text-slate-700">{formatDateIST(order.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-4">
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {pending ? "To pay" : "Total"}
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  ₹{Number(order.grandTotal).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-emerald-700 group-hover:text-white">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {pending && (
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={handlePayNow}
            disabled={paying}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00a300] py-2 text-xs font-semibold text-white hover:bg-[#166534] disabled:opacity-50"
          >
            {paying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Pay now
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 rounded-lg border border-red-300 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel"}
          </button>
        </div>
      )}

      <CancelUnpaidOrderModal
        isOpen={showCancelModal}
        processing={cancelling}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
}
