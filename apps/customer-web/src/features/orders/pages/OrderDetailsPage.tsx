"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  XCircle,
} from "lucide-react";

import Footer from "@/components/customer/Footer";
import Header from "@/components/customer/Header";

import OrderItems from "../components/OrderItems";
import OrderSummary from "../components/OrderSummary";
import OrderTracking from "../components/OrderTracking";
import { useOrder } from "../hooks/useOrders";

export default function OrderDetailsPage() {
  // Using useParams hook safely handles tracking route changes without breaking
  const params = useParams();
  const orderId = params?.orderId as string;

  const {
    order,
    loading,
    processing,
    cancelOrder,
  } = useOrder(orderId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50">
        <AlertCircle
          size={56}
          className="text-slate-300"
        />

        <h2 className="text-2xl font-bold text-slate-900">
          Order Not Found
        </h2>

        <Link
          href="/orders"
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel =
    ![
      "DELIVERED",
      "CANCELLED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
    ].includes(order.status.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-36">

        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600"
          >
            <ChevronLeft size={18} />
            Back
          </Link>

          <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            {order.status.replaceAll("_", " ")}
          </span>

        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            <div className="rounded-2xl border bg-white p-6">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Order Number
                  </p>

                  <h1 className="mt-1 text-3xl font-bold text-slate-900">
                    #{order.orderNumber}
                  </h1>

                </div>

                {canCancel && (
                  <button
                    onClick={cancelOrder}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <XCircle size={16} />
                    )}

                    Cancel Order
                  </button>
                )}

              </div>

              <div className="mt-8">

                <OrderTracking
                  status={order.status}
                />

              </div>

            </div>

            <OrderItems
              items={order.items}
            />
          </div>

          <div className="space-y-6">

            <OrderSummary
              order={order}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Need Help?
              </h3>

              <p className="mb-6 text-sm leading-6 text-slate-500">
                If you have any questions regarding this order,
                our support team is here to help.
              </p>

              <button
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Contact Support
              </button>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}