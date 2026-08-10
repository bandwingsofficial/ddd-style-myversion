"use client";

import { useCallback, useEffect, useState } from "react";

import { OrdersApi } from "../api/orders.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { useOrderSocket } from "./useOrderSocket";
import {
  canUseAuthenticatedApis,
  useCustomerSession,
} from "@/features/customer-auth/hooks/useCustomerSession";
import {
  isSessionTerminated,
} from "@/features/customer-auth/services/auth-sync.service";

function isExpectedTerminatedSessionError(error: unknown): boolean {
  if (isSessionTerminated() || !canUseAuthenticatedApis()) {
    return true;
  }

  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 401 || status === 403;
}

export function useOrders() {
  const { isLoggedIn } = useCustomerSession();
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!canUseAuthenticatedApis()) {
      setOrders([]);
      if (!silent) {
        setLoading(false);
      }
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await OrdersApi.getOrders();

      if (!canUseAuthenticatedApis()) {
        setOrders([]);
        return;
      }

      setOrders(response);
    } catch (error) {
      if (isExpectedTerminatedSessionError(error)) {
        setOrders([]);
        return;
      }

      console.error("Failed to fetch orders", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setOrders([]);
      setLoading(false);
      return;
    }

    void fetchOrders(false);
  }, [isLoggedIn, fetchOrders]);

  useOrderSocket(
    () => {
      if (!canUseAuthenticatedApis()) return;
      void fetchOrders(true);
    },
    { enabled: isLoggedIn },
  );

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      if (!canUseAuthenticatedApis()) return;
      void fetchOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, fetchOrders]);

  return {
    orders,
    loading,
    refetch: () => fetchOrders(false),
  };
}

export function useOrder(orderId: string) {
  const { isLoggedIn } = useCustomerSession();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const fetchOrder = useCallback(
    async (silent = false) => {
      if (!orderId || !canUseAuthenticatedApis()) {
        setOrder(null);
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }

        const response = await OrdersApi.getOrder(orderId);

        if (!canUseAuthenticatedApis()) {
          setOrder(null);
          return;
        }

        setOrder(response);
      } catch (error) {
        if (isExpectedTerminatedSessionError(error)) {
          setOrder(null);
          return;
        }

        console.error("Failed to fetch order", error);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (!orderId || !isLoggedIn) {
      setOrder(null);
      setLoading(false);
      return;
    }

    void fetchOrder(false);
  }, [orderId, isLoggedIn, fetchOrder]);

  useOrderSocket(
    () => {
      if (!canUseAuthenticatedApis()) return;
      void fetchOrder(true);
    },
    { orderId, enabled: isLoggedIn && !!orderId },
  );

  useEffect(() => {
    if (!orderId || !isLoggedIn) return;

    const pollMs =
      order?.status === "PAYMENT_PENDING" ? 5000 : 15000;

    const interval = setInterval(() => {
      if (!canUseAuthenticatedApis()) return;

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
    }, pollMs);

    return () => clearInterval(interval);
  }, [orderId, isLoggedIn, fetchOrder, order?.status]);

  const cancelOrder = useCallback(async () => {
    if (!canUseAuthenticatedApis()) {
      throw new Error("SESSION_NOT_READY");
    }

    setProcessing(true);

    try {
      await OrdersApi.cancelOrder(orderId);

      await fetchOrder(false);
    } catch (error) {
      if (!isExpectedTerminatedSessionError(error)) {
        console.error("Failed to cancel order", error);
      }
      throw error;
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
