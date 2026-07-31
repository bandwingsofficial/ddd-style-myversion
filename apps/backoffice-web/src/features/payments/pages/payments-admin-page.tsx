'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AdminPaymentListItem,
  PaymentsAdminApi,
} from '../api/payments-admin.api';
import { useOrderSocket } from '../hooks/use-order-socket';

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PaymentsAdminApi.list({ page, limit: 20 });
      setPayments(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useOrderSocket(() => {
    void loadPayments();
  });

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor gateway payments, attempts, and verification status.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Attempt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Gateway Order</th>
                <th className="px-4 py-3">Gateway Payment</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Outlet</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">#{payment.attemptNo}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-bold">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{payment.amount}</td>
                    <td className="px-4 py-3 font-mono text-xs">{payment.providerRefId ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{payment.transactionId ?? '—'}</td>
                    <td className="px-4 py-3">{payment.customerName ?? payment.customerId}</td>
                    <td className="px-4 py-3">{payment.outletName ?? payment.outletId}</td>
                    <td className="px-4 py-3">{payment.orderNumber ?? payment.orderId}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-input px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-input px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
