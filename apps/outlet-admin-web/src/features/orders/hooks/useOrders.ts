import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import * as orderApi from '../api/orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from the API
  const loadOrders = useCallback(async () => {
    try {
      const data = await orderApi.fetchOutletOrders();
      if (data && Array.isArray(data)) {
         setOrders(data);
      } else {
         setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and Real-time Polling (every 30 seconds)
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); 
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Handle Order Actions (Accept, Reject, Cook, Dispatch, etc.)
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
      // Immediately reload to reflect the change
      await loadOrders(); 
    } catch (error) {
      alert("Failed to update order status. Please try again.");
      console.error(error);
    }
  };

  // Organize orders into columns for the UI
  const columns = {
    // 1. NEW: Default for Pending, Paid, or unknown statuses
    NEW: orders.filter(o => 
      !o.status || 
      ['PENDING', 'ORDER_PLACED', 'PAID', 'CREATED'].includes(o.status.toUpperCase()) ||
      !['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status.toUpperCase())
    ),

    // 2. KITCHEN: Orders that are confirmed or being prepared
    PREPARING: orders.filter(o => 
      ['CONFIRMED', 'PREPARING', 'ACCEPTED'].includes(o.status?.toUpperCase())
    ),

    // 3. DISPATCH: Orders out for delivery
    DISPATCH: orders.filter(o => 
      ['OUT_FOR_DELIVERY', 'DISPATCHED'].includes(o.status?.toUpperCase())
    ),

    // 4. COMPLETED: Finished or Cancelled orders
    COMPLETED: orders.filter(o => 
      ['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status?.toUpperCase())
    ),
  };

  return { orders, columns, loading, handleStatusChange, refresh: loadOrders };
};