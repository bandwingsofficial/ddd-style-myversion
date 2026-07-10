'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useProductSocket(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
      /\/$/,
      '',
    );

    if (!baseUrl) {
      return;
    }

    const socket: Socket = io(`${baseUrl}/public/products`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('products.updated', () => {
      onUpdateRef.current();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
