'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

export function useOrderSocket(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

    if (!baseUrl) {
      return;
    }

    const socket: Socket = io(`${baseUrl}/public/orders`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const handleUpdate = () => {
      onUpdateRef.current();
    };

    ORDER_SOCKET_EVENTS.forEach((eventName) => {
      socket.on(eventName, handleUpdate);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
