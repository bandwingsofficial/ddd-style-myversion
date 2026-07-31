'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const EVENTS = [
  'order.updated',
  'PaymentSuccess',
  'OrderConfirmed',
  'OrderAccepted',
  'Preparing',
  'Ready',
  'OutForDelivery',
  'Delivered',
  'products.updated',
  'categories.updated',
  'stock_item.updated',
] as const;

export function useDashboardSocket(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    if (!baseUrl) return;

    const socket: Socket = io(`${baseUrl}/public/orders`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const handle = () => onUpdateRef.current();

    EVENTS.forEach((event) => socket.on(event, handle));

    return () => {
      socket.disconnect();
    };
  }, []);
}
