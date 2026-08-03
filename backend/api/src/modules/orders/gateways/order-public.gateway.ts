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

export function outletRoom(outletId: string): string {
  return `outlet:${outletId}`;
}

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
    const outletId = client.handshake.query.outletId as string | undefined;

    if (outletId) {
      await client.join(outletRoom(outletId));
      console.log(
        '✅ [SOCKET CONNECT] order client joined outlet room:',
        outletId,
        client.id,
      );
      return;
    }

    console.log(
      '✅ [SOCKET CONNECT] order client connected (no outlet room):',
      client.id,
    );
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

    this.emitToOutlet(
      payload.outletId as string | undefined,
      ORDER_SOCKET_EVENTS.UPDATED,
      data,
    );
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

    const outletId = payload.outletId as string | undefined;

    if (process.env.NODE_ENV !== 'production') {
      console.info('[outlet-trace]', {
        stage: 'socket.emitOrderEvent',
        eventName,
        outletId: outletId ?? null,
        orderId: (payload.orderId as string | undefined) ?? null,
      });
    }

    this.emitToOutlet(outletId, ORDER_SOCKET_EVENTS.UPDATED, data);
    this.emitToOutlet(outletId, eventName, data);
  }

  private emitToOutlet(
    outletId: string | undefined,
    eventName: string,
    data: Record<string, unknown>,
  ): void {
    if (outletId) {
      this.server.to(outletRoom(outletId)).emit(eventName, data);
      return;
    }

    console.warn(`[SOCKET] Dropped ${eventName} — missing outletId on payload`);
  }
}
