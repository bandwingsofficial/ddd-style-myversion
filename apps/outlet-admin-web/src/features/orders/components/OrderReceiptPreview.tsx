'use client';

import { Order } from '../types';
import { CustomerReceiptBlock } from './CustomerContactDisplay';
import { DeliveryAddressCard } from './DeliveryAddressCard';
import { formatDateIST, formatTimeIST } from '@/lib/format-datetime';

interface OrderReceiptPreviewProps {
  order: Order;
  onClose?: () => void;
}

export function OrderReceiptPreview({ order, onClose }: OrderReceiptPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:relative print:inset-auto print:bg-transparent print:p-0">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl print:max-w-none print:shadow-none print:rounded-none">
        <div className="mb-4 flex items-start justify-between print:hidden">
          <div>
            <h2 className="text-lg font-black text-slate-900">Receipt Preview</h2>
            <p className="text-xs text-slate-500">{order.orderNumber}</p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Close
            </button>
          ) : null}
        </div>

        <article className="space-y-4 text-sm text-slate-800">
          <header>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Order Receipt
            </p>
            <p className="text-lg font-black">{order.orderNumber}</p>
            <p className="text-xs text-slate-500">
              {formatDateIST(order.createdAt)} · {formatTimeIST(order.createdAt)}
            </p>
          </header>

          <CustomerReceiptBlock order={order} />

          {order.address ? (
            <section>
              <DeliveryAddressCard address={order.address} />
            </section>
          ) : null}

          <section className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Items</p>
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span>₹{item.totalPrice}</span>
              </div>
            ))}
          </section>

          <footer className="border-t border-slate-200 pt-3">
            <div className="flex justify-between font-black text-base">
              <span>Grand Total</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </footer>
        </article>

        <div className="mt-6 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
