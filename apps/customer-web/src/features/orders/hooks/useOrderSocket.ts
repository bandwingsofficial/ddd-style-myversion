'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface OrderSocketPayload {
  orderId?: string;
  outletId?: string;
  customerId?: string;
  status?: string;
  eventType?: string;
  version?: number;
}

const ORDER_SOCKET_EVENTS = [
  'order.updated',
  'PaymentSuccess',
  'OrderConfirmed',
  'OrderAccepted',
  'Preparing',
  'Ready',
  'OutForDelivery',
  'Delivered',
] as const;

export function useOrderSocket(
  onUpdate: (payload?: OrderSocketPayload) => void,
  filter?: {
    orderId?: string;
    outletId?: string;
    customerId?: string;
    enabled?: boolean;
  },
) {
  const onUpdateRef = useRef(onUpdate);
  const filterRef = useRef(filter);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const enabled = filter?.enabled !== false;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

    if (!baseUrl) {
      return;
    }

    const socket: Socket = io(`${baseUrl}/public/orders`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const handleUpdate = (payload: OrderSocketPayload) => {
      const currentFilter = filterRef.current;

      if (
        currentFilter?.orderId &&
        payload.orderId &&
        payload.orderId !== currentFilter.orderId
      ) {
        return;
      }

      if (
        currentFilter?.outletId &&
        payload.outletId &&
        payload.outletId !== currentFilter.outletId
      ) {
        return;
      }

      if (
        currentFilter?.customerId &&
        payload.customerId &&
        payload.customerId !== currentFilter.customerId
      ) {
        return;
      }

      onUpdateRef.current(payload);
    };

    ORDER_SOCKET_EVENTS.forEach((eventName) => {
      socket.on(eventName, handleUpdate);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
