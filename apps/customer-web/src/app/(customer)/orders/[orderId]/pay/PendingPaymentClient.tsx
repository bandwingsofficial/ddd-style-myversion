"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Clock,
  Home,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Header from "@/components/customer/Header";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { formatDateIST, formatTimeIST } from "@/lib/format-datetime";
import {
  isPaymentExpired,
  isPendingPayment,
} from "@/features/orders/order-status.util";
import PaymentPendingSection from "@/features/orders/components/PaymentPendingSection";
import CancelUnpaidOrderModal from "@/features/orders/components/CancelUnpaidOrderModal";
import { useRetryPayment } from "@/features/orders/hooks/useRetryPayment";

interface PendingPaymentClientProps {
  orderId: string;
}

export default function PendingPaymentClient({ orderId }: PendingPaymentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoPay = searchParams.get("autoPay") === "1";
  const autoPayStarted = useRef(false);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const data = await CheckoutApi.getOrder(orderId);
      setOrder(data);
      return data;
    } catch {
      setOrder(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const { paying, startPayment } = useRetryPayment(orderId, () => {
    void loadOrder();
  });

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (
      autoPay &&
      !autoPayStarted.current &&
      order &&
      isPendingPayment(order)
    ) {
      autoPayStarted.current = true;
      void startPayment();
    }
  }, [autoPay, order, startPayment]);

  useEffect(() => {
    if (!order || order.status !== "PAYMENT_PENDING") return;

    const interval = setInterval(() => {
      void loadOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [order, loadOrder]);

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await CheckoutApi.cancelOrder(orderId);
      toast.success("Order cancelled.");
      setShowCancelModal(false);
      router.replace("/orders");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fafafa] px-4">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="text-lg font-medium text-slate-900">Order not found</p>
        <Link href="/orders" className="text-sm font-medium text-[#15803D]">
          View orders
        </Link>
      </div>
    );
  }

  const pending = isPendingPayment(order);
  const expired = isPaymentExpired(order);

  if (expired || !pending) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Header />
        <main className="customer-page-shell mobile-container max-w-lg pb-16">
          <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Clock className="h-7 w-7 text-slate-500" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Payment expired</h1>
            <p className="mt-2 text-sm text-slate-600">
              This order has been cancelled automatically.
            </p>
            <p className="mt-1 font-mono text-xs text-slate-400">#{order.orderNumber}</p>

            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                href="/menu"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#15803D] text-sm font-semibold text-white hover:bg-[#166534]"
              >
                Order again
              </Link>
              <Link
                href="/home"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Home size={15} /> Back home
              </Link>
              <Link
                href="/orders"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:col-span-2"
              >
                View orders
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />

      <main className="customer-page-shell mobile-container max-w-lg pb-16">
        <Breadcrumbs
          items={[
            { label: "Orders", href: "/orders" },
            { label: "Payment" },
          ]}
        />

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="mb-5 text-center">
            <p className="font-mono text-sm text-slate-500">#{order.orderNumber}</p>
          </div>

          <PaymentPendingSection
            order={order}
            paying={paying}
            cancelling={cancelling}
            onPayNow={() => void startPayment()}
            onCancelClick={() => setShowCancelModal(true)}
            detailsHref={`/orders/${order.id}`}
            detailsLabel="Order details"
          />

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Placed</span>
              <span className="text-slate-900">
                {formatDateIST(order.createdAt)} · {formatTimeIST(order.createdAt)}
              </span>
            </div>
            <div className="flex gap-2 text-slate-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">{order.address.label}</p>
                <p className="text-slate-600">{order.address.addressText}</p>
              </div>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100 pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-slate-700">
                  {item.quantity}× {item.productName}
                </span>
                <span className="font-medium text-slate-900">₹{item.totalPrice}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Payments are secured by Razorpay
          </div>
        </div>
      </main>

      <CancelUnpaidOrderModal
        isOpen={showCancelModal}
        processing={cancelling}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
}
