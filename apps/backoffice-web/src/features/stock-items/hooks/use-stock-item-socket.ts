'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const STOCK_ITEM_EVENTS = [
  'stock_item.created',
  'stock_item.updated',
  'stock_item.enabled',
  'stock_item.disabled',
  'stock_item.deleted',
  'stock_item.unit.changed',
];

export function useStockItemSocket(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

    if (!baseUrl) {
      return;
    }

    const socket: Socket = io(`${baseUrl}/public/stock-items`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const handleUpdate = () => {
      onUpdateRef.current();
    };

    for (const event of STOCK_ITEM_EVENTS) {
      socket.on(event, handleUpdate);
    }

    return () => {
      socket.disconnect();
    };
  }, []);
}
