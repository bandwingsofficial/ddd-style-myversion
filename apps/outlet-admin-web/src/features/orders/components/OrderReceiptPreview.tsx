'use client';

import { Order, CustomerAddress } from '../types';
import { resolveOrderCustomer } from '@/lib/customer-display';
import { formatDateIST, formatTimeIST } from '@/lib/format-datetime';

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

function ReceiptAddress({ address }: { address: CustomerAddress }) {
  const hasStructuredFields =
    address.houseNumber ||
    address.street ||
    address.landmark ||
    address.pincode;

  return (
    <section className="border-b border-dashed border-slate-200 pb-2.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        Delivery Address
      </p>
      <div className="mt-1 space-y-0.5 text-xs text-slate-700">
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
          <p className="leading-relaxed">{address.addressText}</p>
        ) : null}
      </div>
    </section>
  );
}

function ReceiptContent({ order }: { order: Order }) {
  const customer = resolveOrderCustomer(order);
  const paymentLabel = formatPaymentStatus(order);

  return (
    <article className="receipt-print-content space-y-2.5 text-xs text-slate-800">
      <header className="border-b border-dashed border-slate-200 pb-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Order Receipt
        </p>
        <p className="text-base font-black text-slate-900">{order.orderNumber}</p>
        <p className="text-[11px] text-slate-500">
          {formatDateIST(order.createdAt)} · {formatTimeIST(order.createdAt)}
        </p>
      </header>

      <section className="border-b border-dashed border-slate-200 pb-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Customer
        </p>
        <p className="mt-1 font-semibold text-slate-900">{customer.displayName}</p>
        {customer.phone ? (
          <p className="text-slate-600">{customer.phone}</p>
        ) : null}
        {customer.email ? (
          <p className="text-slate-600">{customer.email}</p>
        ) : null}
      </section>

      {order.address ? <ReceiptAddress address={order.address} /> : null}

      <section className="space-y-1.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Items
        </p>
        {(order.items ?? []).map((item) => (
          <div key={item.id} className="flex justify-between gap-3 text-xs">
            <span className="min-w-0 flex-1">
              {item.quantity}x {item.productName}
            </span>
            <span className="shrink-0 font-medium">₹{item.totalPrice}</span>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 pt-2.5">
        <div className="flex justify-between text-sm font-black text-slate-900">
          <span>Grand Total</span>
          <span>₹{order.grandTotal}</span>
        </div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Payment: {paymentLabel}
        </p>
      </footer>
    </article>
  );
}

export function OrderReceiptPreview({ order, onClose }: OrderReceiptPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

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
            <ReceiptContent order={order} />
          </div>

          <div className="shrink-0 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      <div className="receipt-print-only hidden print:block">
        <ReceiptContent order={order} />
      </div>
    </>
  );
}
