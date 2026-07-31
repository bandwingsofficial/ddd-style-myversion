"use client";

import {
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  Phone,
} from "lucide-react";

const SUPPORT_EMAIL = "cantenonline@gmail.com";
const SUPPORT_PHONE = "+91 99029 30777";
const SUPPORT_TEL = "tel:+919902930777";
const SUPPORT_MAIL = "mailto:cantenonline@gmail.com";

interface SupportCardProps {
  className?: string;
  compact?: boolean;
}

export default function SupportCard({
  className = "",
  compact = false,
}: SupportCardProps) {
  return (
    <div
      className={`rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Headphones size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Need help?
          </h3>
          <p className="text-sm text-slate-500">
            Contact our Support Team
          </p>
        </div>
      </div>

      <div className={`space-y-3 ${compact ? "text-sm" : ""}`}>
        <a
          href={SUPPORT_MAIL}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50"
        >
          <Mail size={18} className="shrink-0 text-emerald-600" />
          <span className="font-medium break-all">{SUPPORT_EMAIL}</span>
        </a>

        <a
          href={SUPPORT_TEL}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50"
        >
          <Phone size={18} className="shrink-0 text-emerald-600" />
          <span className="font-medium">{SUPPORT_PHONE}</span>
        </a>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href={SUPPORT_TEL}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Phone size={16} />
          Call Support
        </a>
        <a
          href={SUPPORT_MAIL}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          <Mail size={16} />
          Mail Support
        </a>
      </div>
    </div>
  );
}

export function EstimatedPrepTime({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 ${className}`}
    >
      <Clock size={18} className="shrink-0 text-amber-600" />
      <div>
        <p className="text-sm font-semibold text-amber-900">
          Estimated Preparation Time
        </p>
        <p className="text-sm text-amber-700">
          25–35 minutes
        </p>
      </div>
    </div>
  );
}

export function PaymentSuccessBanner({
  orderNumber,
  className = "",
}: {
  orderNumber?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          size={28}
          className="shrink-0 text-emerald-600"
        />
        <div>
          <h2 className="text-xl font-bold text-emerald-900">
            Payment Successful
          </h2>
          <p className="mt-1 text-sm font-medium text-emerald-800">
            Order Confirmed
          </p>
          {orderNumber && (
            <p className="mt-2 text-sm text-emerald-700">
              Order #{orderNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
