'use client';

import { Package, Printer } from 'lucide-react';

import {
  formatPaymentAmount,
  formatRupeeAmount,
} from '@/lib/format-currency';

import { AdminOrderDetail } from '../types/order.types';
import { OrderStatusBadge } from './order-status-badge';

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function OrderDetailsView({ order }: { order: AdminOrderDetail }) {
  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Order
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {order.orderNumber ?? order.id}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <OrderStatusBadge status={order.paymentStatus} />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Order Items">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border/70 p-3"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.quantity} · Unit{' '}
                      {formatRupeeAmount(
                        item.discountPrice ?? item.unitPrice,
                      )}
                    </p>
                  </div>
                  <p className="font-bold text-foreground">
                    {formatRupeeAmount(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Pricing Summary">
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatRupeeAmount(order.pricing.subtotal)} />
              <Row label="Discount" value={formatRupeeAmount(order.pricing.discount)} />
              <Row
                label="Net Subtotal"
                value={formatRupeeAmount(order.pricing.netSubtotal)}
              />
              <Row
                label="Delivery Charge"
                value={formatRupeeAmount(order.pricing.deliveryFee)}
              />
              <div className="border-t border-border pt-2">
                <Row
                  label="Grand Total"
                  value={formatRupeeAmount(order.pricing.grandTotal)}
                  strong
                />
              </div>
            </dl>
          </Section>

          {order.cancellationReason && (
            <Section title="Notes">
              <p className="text-sm text-red-700">
                Cancellation reason: {order.cancellationReason}
              </p>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Outlet">
            <p className="font-semibold text-foreground">{order.outlet.name}</p>
          </Section>

          <Section title="Customer">
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={order.customer.name} />
              <Row label="Phone" value={order.customer.phone} />
              <Row label="Email" value={order.customer.email ?? '—'} />
            </dl>
          </Section>

          <Section title="Delivery Address">
            <p className="text-sm font-semibold text-foreground">{order.address.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.address.addressText}</p>
          </Section>

          <Section title="Payment">
            {order.payment ? (
              <dl className="space-y-2 text-sm">
                <Row label="Gateway" value={order.payment.gateway ?? '—'} />
                <Row label="Transaction ID" value={order.payment.transactionId ?? '—'} />
                <Row label="Method" value={order.payment.method} />
                <Row label="Status" value={order.payment.status} />
                <Row
                  label="Amount"
                  value={formatPaymentAmount(order.payment.amount)}
                />
                <Row label="Paid At" value={formatDateTime(order.payment.paidAt)} />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No payment record found.</p>
            )}
          </Section>

          <Section title="Order History">
            <ol className="space-y-3">
              {order.timeline.length === 0 ? (
                <li className="text-sm text-muted-foreground">No timeline events.</li>
              ) : (
                order.timeline.map((event, index) => (
                  <li key={`${event.type}-${index}`} className="relative pl-4">
                    <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-semibold text-foreground">{event.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(event.at)}</p>
                    {event.note && (
                      <p className="mt-1 text-xs text-muted-foreground">{event.note}</p>
                    )}
                  </li>
                ))
              )}
            </ol>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? 'font-bold text-foreground' : 'font-medium text-foreground'}>
        {value}
      </dd>
    </div>
  );
}
