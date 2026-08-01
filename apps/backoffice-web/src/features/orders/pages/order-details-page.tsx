'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { getApiErrorMessage } from '@/lib/api-error';

import { OrdersAdminApi } from '../api/orders-admin.api';
import { OrderDetailsView } from '../components/order-details-view';
import { AdminOrderDetail } from '../types/order.types';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await OrdersAdminApi.getById(orderId);
      setOrder(data);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load order');
      if (message.toLowerCase().includes('not found')) {
        setNotFound(true);
        setOrder(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The order you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Unable to load order</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error ?? 'Unknown error'}</p>
        <button
          type="button"
          onClick={() => void loadOrder()}
          className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 font-sans md:p-4">
      <div className="mb-6 print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
      </div>

      <OrderDetailsView order={order} />
    </div>
  );
}
