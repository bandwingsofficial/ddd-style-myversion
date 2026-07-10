import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useCategorySocket(onUpdate: () => void) {
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

    const socket: Socket = io(`${baseUrl}/public/categories`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('categories.updated', () => {
      onUpdateRef.current();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
