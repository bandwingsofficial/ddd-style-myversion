import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Order } from '../types';
import * as orderApi from '../api/orders';
import { useOrderSocket } from './useOrderSocket';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data = await orderApi.fetchOutletOrders();
      if (data && Array.isArray(data)) {
         setOrders(data);
      } else {
         setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadOrders(false);
  }, [loadOrders]);

  useOrderSocket(() => {
    void loadOrders(true);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      void loadOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusChange = async (
    orderId: string, 
    action: 'accept' | 'reject' | 'prepare' | 'deliver' | 'complete'
  ) => {
    try {
      switch (action) {
        case 'accept': await orderApi.acceptOrder(orderId); break;
        case 'reject': await orderApi.rejectOrder(orderId); break;
        case 'prepare': await orderApi.setPreparing(orderId); break;
        case 'deliver': await orderApi.setOutForDelivery(orderId); break;
        case 'complete': await orderApi.setDelivered(orderId); break;
      }
      await loadOrders(true);
    } catch (error) {
      toast.error('Failed to update order status. Please try again.');
      console.error(error);
    }
  };

  const columns = {
    NEW: orders.filter((order) =>
      order.status?.toUpperCase() === 'PAID',
    ),

    PREPARING: orders.filter((order) =>
      ['CONFIRMED', 'PREPARING'].includes(order.status?.toUpperCase() ?? ''),
    ),

    DISPATCH: orders.filter((order) =>
      order.status?.toUpperCase() === 'OUT_FOR_DELIVERY',
    ),

    COMPLETED: orders.filter((order) =>
      ['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status?.toUpperCase() ?? ''),
    ),
  };

  return { 
    orders, 
    columns, 
    loading, 
    handleStatusChange, 
    refresh: () => loadOrders(false),
  };
};
