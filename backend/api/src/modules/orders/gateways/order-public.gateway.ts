import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

export const ORDER_SOCKET_EVENTS = {
  UPDATED: 'order.updated',
  PAYMENT_SUCCESS: 'PaymentSuccess',
  ORDER_CONFIRMED: 'OrderConfirmed',
  ORDER_ACCEPTED: 'OrderAccepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'OutForDelivery',
  DELIVERED: 'Delivered',
} as const;

@WebSocketGateway({
  namespace: '/public/orders',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class OrderPublicGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  constructor() {
    console.log('🚀 [GATEWAY INIT] OrderPublicGateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    console.log('✅ [SOCKET CONNECT] order client connected:', client.id);
  }

  async emitOrderUpdate(
    payload: Record<string, unknown>,
    client?: Socket,
  ): Promise<void> {
    const data = {
      version: Date.now(),
      ...payload,
    };

    if (client) {
      client.emit(ORDER_SOCKET_EVENTS.UPDATED, data);
      return;
    }

    this.server.emit(ORDER_SOCKET_EVENTS.UPDATED, data);
  }

  async emitOrderEvent(
    eventName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const data = {
      eventType: eventName,
      version: Date.now(),
      ...payload,
    };

    this.server.emit(ORDER_SOCKET_EVENTS.UPDATED, data);
    this.server.emit(eventName, data);
  }
}
