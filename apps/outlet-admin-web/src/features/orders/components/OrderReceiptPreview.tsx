'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Order, CustomerAddress } from '../types';
import { resolveOrderCustomer } from '@/lib/customer-display';
import { formatCurrency } from '@/lib/format-currency';
import { formatDateIST, formatTimeIST } from '@/lib/format-datetime';
import { outletService } from '@/features/outlet/services/outletService';

interface OrderReceiptPreviewProps {
  order: Order;
  onClose?: () => void;
}

function formatPaymentStatus(order: Order): string {
  const status = order.paymentStatus?.toUpperCase();
  if (status) return status;
  if (order.status === 'PAID' || order.status === 'CONFIRMED') return 'PAID';
  return order.status.replaceAll('_', ' ');
}

/** Fixed canteen contact details. Outlet name comes from authenticated /my-outlet. */
const CANTEN_CONTACT = {
  phone: '+91 99029 62777',
  phoneHref: 'tel:+919902962777',
  email: 'cantenonline@gmail.com',
  emailHref: 'mailto:cantenonline@gmail.com',
} as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="receipt-section-heading text-[10px] font-black uppercase tracking-widest text-slate-500">
      {children}
    </p>
  );
}

function ReceiptAddress({ address }: { address: CustomerAddress }) {
  const hasStructuredFields =
    address.houseNumber ||
    address.street ||
    address.landmark ||
    address.pincode;

  return (
    <section className="receipt-section receipt-address border-b border-dashed border-slate-200 pb-2">
      <SectionHeading>Delivery Address</SectionHeading>
      <div className="receipt-address-body mt-1 space-y-0.5 break-words text-xs leading-snug text-slate-700">
        {address.label ? (
          <p className="font-semibold text-slate-900">{address.label}</p>
        ) : null}
        {hasStructuredFields ? (
          <>
            {address.houseNumber ? <p>{address.houseNumber}</p> : null}
            {address.street ? <p>{address.street}</p> : null}
            {address.landmark ? <p>{address.landmark}</p> : null}
            {address.pincode ? <p>{address.pincode}</p> : null}
          </>
        ) : address.addressText ? (
          <p>{address.addressText}</p>
        ) : null}
      </div>
    </section>
  );
}

function ReceiptContent({
  order,
  outletName,
}: {
  order: Order;
  outletName: string;
}) {
  const customer = resolveOrderCustomer(order);
  const paymentLabel = formatPaymentStatus(order);
  const dateTime = `${formatDateIST(order.createdAt)} · ${formatTimeIST(order.createdAt)}`;

  return (
    <article className="receipt-print-content text-xs text-slate-800">
      <section className="receipt-section receipt-canten border-b border-dashed border-slate-200 pb-2 text-center sm:text-left">
        <SectionHeading>Canten Outlet</SectionHeading>
        <div className="receipt-party-body mt-1 space-y-0.5">
          <p className="receipt-outlet-name font-semibold text-slate-900">
            {outletName || '—'}
          </p>
          <a
            href={CANTEN_CONTACT.phoneHref}
            className="receipt-canten-phone block break-all text-slate-600 hover:text-emerald-700"
          >
            {CANTEN_CONTACT.phone}
          </a>
          <a
            href={CANTEN_CONTACT.emailHref}
            className="receipt-canten-email block break-all text-slate-600 hover:text-emerald-700"
          >
            {CANTEN_CONTACT.email}
          </a>
        </div>
      </section>

      <header className="receipt-header receipt-section border-b border-dashed border-slate-200 py-2">
        <p className="receipt-title text-sm font-black uppercase text-slate-900">
          Order Receipt
        </p>
        <div className="receipt-meta mt-2 space-y-1">
          <div className="receipt-meta-row">
            <span className="receipt-field-label font-semibold text-slate-600">
              Order No:
            </span>
            <p className="receipt-order-number font-black text-slate-900">
              {order.orderNumber}
            </p>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-field-label font-semibold text-slate-600">
              Date:
            </span>
            <p className="receipt-date text-slate-700">{dateTime}</p>
          </div>
        </div>
      </header>

      <section className="receipt-section receipt-customer border-b border-dashed border-slate-200 py-2">
        <SectionHeading>Customer</SectionHeading>
        <div className="receipt-party-body mt-1 space-y-0.5">
          <p className="break-words font-semibold text-slate-900">
            {customer.fullName || customer.displayName}
          </p>
          {customer.phone ? (
            <p className="break-all text-slate-600">{customer.phone}</p>
          ) : null}
          {customer.email ? (
            <p className="break-all text-slate-600">{customer.email}</p>
          ) : null}
        </div>
      </section>

      {order.address ? <ReceiptAddress address={order.address} /> : null}

      <section className="receipt-section receipt-items py-2">
        <SectionHeading>Items</SectionHeading>
        <div className="receipt-items-header mt-1 grid grid-cols-[2.25rem_1fr_auto] gap-x-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Qty</span>
          <span>Item</span>
          <span className="text-right">Price</span>
        </div>
        <div className="receipt-items-body space-y-1">
          {(order.items ?? []).map((item) => (
            <div
              key={item.id}
              className="receipt-item-row grid grid-cols-[2.25rem_1fr_auto] gap-x-2 text-xs"
            >
              <span className="shrink-0 font-medium text-slate-800">
                {item.quantity}x
              </span>
              <span className="min-w-0 break-words text-slate-700">
                {item.productName}
              </span>
              <span className="receipt-item-price shrink-0 text-right font-medium text-slate-800">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="receipt-footer receipt-section border-t border-dashed border-slate-200 pt-2">
        <div className="receipt-summary-row flex items-baseline justify-between gap-2 text-xs text-slate-800">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="receipt-summary-row mt-1 flex items-baseline justify-between gap-2 text-xs text-slate-800">
          <span>Delivery Fee</span>
          <span>{formatCurrency(order.deliveryFee ?? 0)}</span>
        </div>
        <div className="receipt-summary-row mt-1 flex items-baseline justify-between gap-2 text-xs text-slate-800">
          <span>Savings</span>
          <span>
            {(order.discount ?? 0) > 0
              ? `-${formatCurrency(order.discount)}`
              : formatCurrency(order.discount ?? 0)}
          </span>
        </div>
        <div className="receipt-summary-divider my-1 border-t border-dashed border-slate-200" />
        <div className="receipt-total-row flex items-baseline justify-between gap-2">
          <span className="receipt-total-label text-sm font-black text-slate-900">
            Grand Total
          </span>
          <span className="receipt-total-value text-sm font-black text-slate-900">
            {formatCurrency(order.grandTotal)}
          </span>
        </div>
        <div className="receipt-payment-row mt-1 flex items-baseline justify-between gap-2">
          <span className="receipt-section-heading text-[10px] font-black uppercase tracking-widest text-slate-500">
            Payment Status
          </span>
          <span className="receipt-payment-value text-[11px] font-semibold uppercase tracking-wide text-slate-800">
            {paymentLabel}
          </span>
        </div>
      </footer>
    </article>
  );
}

export function OrderReceiptPreview({ order, onClose }: OrderReceiptPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [outletName, setOutletName] = useState('');
  const [outletLoading, setOutletLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    return () => {
      document.body.classList.remove('receipt-print-active');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    outletService
      .getOutlet()
      .then((outlet) => {
        if (!cancelled) {
          setOutletName(outlet.name);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOutletName('');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOutletLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrint = () => {
    if (!outletName) {
      return;
    }

    const previousTitle = document.title;
    document.title = ' ';
    document.body.classList.add('receipt-print-active');

    const restore = () => {
      document.title = previousTitle;
      document.body.classList.remove('receipt-print-active');
    };

    window.addEventListener('afterprint', restore, { once: true });
    window.print();
  };

  const receiptProps = { order, outletName };

  const printLayer =
    mounted &&
    outletName &&
    createPortal(
      <div className="receipt-print-only hidden" aria-hidden="true">
        <ReceiptContent {...receiptProps} />
      </div>,
      document.body,
    );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
        <div className="flex max-h-[min(85vh,560px)] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Receipt Preview</h2>
              <p className="text-[11px] text-slate-500">{order.orderNumber}</p>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <ReceiptContent {...receiptProps} />
          </div>

          <div className="shrink-0 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={handlePrint}
              disabled={outletLoading || !outletName}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {outletLoading ? 'Loading outlet…' : 'Print Receipt'}
            </button>
          </div>
        </div>
      </div>

      {printLayer}
    </>
  );
}
