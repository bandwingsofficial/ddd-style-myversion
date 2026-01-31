import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

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

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH                             */
  /* ================================================= */

  async emitOrderUpdate(payload: any, client?: Socket): Promise<void> {
    const data = {
      version: Date.now(),
      ...payload,
    };

    if (client) {
      client.emit('order.updated', data);
    } else {
      this.server.emit('order.updated', data);
    }
  }
}
