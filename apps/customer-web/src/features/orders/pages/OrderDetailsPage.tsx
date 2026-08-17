"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import Script from "next/script";
import { toast } from "sonner";

import {
  AlertCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";

import Footer from "@/components/customer/Footer";
import Header from "@/components/customer/Header";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

import OrderItems from "../components/OrderItems";
import OrderSummary from "../components/OrderSummary";
import OrderTracking from "../components/OrderTracking";
import PaymentPendingOrderDetails from "../components/PaymentPendingOrderDetails";
import CancelUnpaidOrderModal from "../components/CancelUnpaidOrderModal";
import SupportCard, {
  EstimatedPrepTime,
  PaymentSuccessBanner,
} from "../components/SupportCard";
import { useOrder } from "../hooks/useOrders";
import { useRetryPayment } from "../hooks/useRetryPayment";
import {
  isPaymentExpired,
  isPendingPayment,
} from "../order-status.util";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const {
    order,
    loading,
    processing,
    refetch,
    cancelOrder,
  } = useOrder(orderId);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const { paying, startPayment } = useRetryPayment(orderId, () => {
    void refetch();
  });

  const isPending = order ? isPendingPayment(order) : false;
  const isExpired = order ? isPaymentExpired(order) : false;

  const handleConfirmCancel = async () => {
    try {
      await cancelOrder();
      toast.success("Order cancelled.");
      setShowCancelModal(false);
      void refetch();
    } catch {
      toast.error("Could not cancel order.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A300]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8FAFC]">
        <AlertCircle size={56} className="text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <Link
          href="/orders"
          className="rounded-[10px] bg-[#00A300] px-6 py-3 font-semibold text-white hover:bg-[#009000]"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const showFulfillmentProgress = !isPending && !isExpired;
  const showPaymentSuccess = showFulfillmentProgress && [
    "PAID",
    "CONFIRMED",
    "PREPARING",
    "READY_TO_DISPATCH",
    "OUT_FOR_DELIVERY",
  ].includes(order.status.toUpperCase());

  const deliveredAt =
    order.status.toUpperCase() === "DELIVERED"
      ? order.updatedAt ?? order.createdAt
      : null;

  const statusBadge = isPending
    ? "Payment Pending"
    : isExpired
      ? "Payment Expired"
      : order.paymentStatus === "PAID" && order.status === "PAID"
        ? "PAID · AWAITING OUTLET"
        : order.displayStatus ?? order.status.replaceAll("_", " ");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />

      <main className="customer-page-shell mobile-container mt-4 max-w-7xl pb-12">
        <Breadcrumbs
          items={[
            { label: "Orders", href: "/orders" },
            { label: order.orderNumber ? `#${order.orderNumber}` : "Order Details" },
          ]}
        />

        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A300]"
          >
            <ChevronLeft size={18} />
            Back
          </Link>

          {!isPending && (
            <span
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                isExpired
                  ? "bg-slate-100 text-slate-600"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {statusBadge}
            </span>
          )}
        </div>

        {isPending ? (
          <PaymentPendingOrderDetails
            order={order}
            paying={paying}
            cancelling={processing}
            onPayNow={() => void startPayment()}
            onCancelClick={() => setShowCancelModal(true)}
          />
        ) : isExpired ? (
          <div className="mx-auto max-w-lg">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
              <h1 className="text-[32px] font-bold text-slate-900">
                #{order.orderNumber}
              </h1>
              <h2 className="mt-4 text-[22px] font-semibold text-slate-900">
                Payment expired
              </h2>
              <p className="mt-2 text-base text-slate-600">
                This order has been cancelled automatically.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/menu"
                  className="inline-flex h-[42px] items-center justify-center rounded-[10px] bg-[#00A300] px-5 text-base font-semibold text-white hover:bg-[#009000]"
                >
                  Order again
                </Link>
                <Link
                  href="/home"
                  className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-5 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back home
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-5 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  View orders
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
            <div className="space-y-8">
              {showPaymentSuccess && <EstimatedPrepTime />}
              {showPaymentSuccess && (
                <PaymentSuccessBanner orderNumber={order.orderNumber} />
              )}

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <h1 className="mt-1 text-[32px] font-bold text-slate-900">
                    #{order.orderNumber}
                  </h1>
                </div>

                <div className="mt-8">
                  <OrderTracking status={order.status} deliveredAt={deliveredAt} />
                </div>
              </div>

              <OrderItems items={order.items} />
            </div>

            <div className="space-y-8">
              <OrderSummary order={order} />
              <SupportCard />
            </div>
          </div>
        )}
      </main>

      <Footer />

      <CancelUnpaidOrderModal
        isOpen={showCancelModal}
        processing={processing}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
}
