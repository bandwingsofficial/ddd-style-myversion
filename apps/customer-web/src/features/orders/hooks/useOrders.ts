"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { OrdersApi } from "../api/orders.api";
import { Order } from "../types/order.types";
import { OrderDetails } from "@/features/checkout/checkout.types";

export function useOrders() {
  const [orders, setOrders] =
  useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await OrdersApi.getOrders();

      setOrders(response);
    } catch (error) {
      console.error(
        "Failed to fetch orders",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    refetch: fetchOrders,
  };
}

export function useOrder(orderId: string) {
 const [order, setOrder] =
  useState<OrderDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const fetchOrder = useCallback(
    async (silent = false) => {
      try {
        // Show loader only on first load
        if (!silent) {
          setLoading(true);
        }

        const response =
          await OrdersApi.getOrder(orderId);

        setOrder(response);
      } catch (error) {
        console.error(
          "Failed to fetch order",
          error,
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [orderId],
  );

  // Initial Load
  useEffect(() => {
    if (!orderId) return;

    fetchOrder(false);
  }, [orderId, fetchOrder]);

  // Polling
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      setOrder((currentOrder) => {
        if (
          currentOrder &&
          currentOrder.status !== "DELIVERED" &&
          currentOrder.status !== "CANCELLED"
        ) {
          fetchOrder(true);
        }

        return currentOrder;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, fetchOrder]);

  const cancelOrder =
    useCallback(async () => {
      setProcessing(true);

      try {
        await OrdersApi.cancelOrder(
          orderId,
        );

        await fetchOrder(false);
      } catch (error) {
        console.error(
          "Failed to cancel order",
          error,
        );
      } finally {
        setProcessing(false);
      }
    }, [orderId, fetchOrder]);

  return {
    order,
    loading,
    processing,
    refetch: () => fetchOrder(false),
    cancelOrder,
  };
}