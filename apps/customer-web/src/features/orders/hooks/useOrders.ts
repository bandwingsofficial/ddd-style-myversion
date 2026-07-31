"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { OrdersApi } from "../api/orders.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { useOrderSocket } from "./useOrderSocket";

export function useOrders() {
  const [orders, setOrders] =
  useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response =
        await OrdersApi.getOrders();

      setOrders(response);
    } catch (error) {
      console.error(
        "Failed to fetch orders",
        error,
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  useOrderSocket(() => {
    void fetchOrders(true);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    refetch: () => fetchOrders(false),
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

  useEffect(() => {
    if (!orderId) return;

    fetchOrder(false);
  }, [orderId, fetchOrder]);

  useOrderSocket(
    () => {
      void fetchOrder(true);
    },
    { orderId },
  );

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      setOrder((currentOrder) => {
        if (
          currentOrder &&
          currentOrder.status !== "DELIVERED" &&
          currentOrder.status !== "CANCELLED"
        ) {
          void fetchOrder(true);
        }

        return currentOrder;
      });
    }, 15000);

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
