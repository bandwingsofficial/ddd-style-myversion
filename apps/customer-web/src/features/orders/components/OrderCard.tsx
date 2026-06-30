"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { OrderDetails } from "@/features/checkout/checkout.types";

interface OrderCardProps {
  order: OrderDetails;
}

function getStatus(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return {
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: <CheckCircle size={14} className="text-emerald-600" />,
      };
    case "PAID":
      return {
        color: "bg-blue-50 text-blue-700 border-blue-100",
        icon: <Truck size={14} className="text-blue-600" />,
      };
    case "CANCELLED":
      return {
        color: "bg-rose-50 text-rose-700 border-rose-100",
        icon: <XCircle size={14} className="text-rose-600" />,
      };
    default:
      return {
        color: "bg-amber-50 text-amber-700 border-amber-100",
        icon: <Clock size={14} className="text-amber-600" />,
      };
  }
}

export default function OrderCard({ order }: OrderCardProps) {
  const status = getStatus(order.status);

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left Side: Order Info & Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-bold tracking-tight text-slate-800">
            #{order.orderNumber}
          </div>
          
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${status.color}`}
          >
            {status.icon}
            {order.status.replaceAll("_", " ")}
          </div>
        </div>

        {/* Right Side: Quick Specs / Metrics */}
        <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-4 sm:border-none sm:pt-0">
          
          <div className="flex items-center gap-6">
            {/* Items Count Badge */}
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-50 p-2 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Package size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Items
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {order.itemCount} {order.itemCount === 1 ? "Item" : "Items"}
                </p>
              </div>
            </div>

            {/* Placement Date Badge */}
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-50 p-2 text-slate-500">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ordered On
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Forward Navigation Action */}
          <div className="flex items-center gap-4 pl-4 sm:border-l sm:border-slate-100">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Paid
              </p>
              <p className="text-lg font-extrabold text-slate-900">
                ₹{Number(order.grandTotal).toLocaleString("en-IN")}
              </p>
            </div>
            
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:translate-x-0.5">
              <ArrowRight size={16} />
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}