import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { DeliverySocketEvent } from '../events/delivery-events.types';

@WebSocketGateway({
  namespace: '/public/delivery',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class DeliveryPublicGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* CONNECT                                           */
  /* ================================================= */

  async handleConnection(client: Socket): Promise<void> {
    console.log(
      '🚴 [SOCKET CONNECT] delivery client connected:',
      client.id,
    );
  }

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH                            */
  /* ================================================= */

  async emitDeliveryUpdate(
    payload: DeliverySocketEvent,
    client?: Socket,
  ): Promise<void> {
    console.log(
      '📡 [SOCKET EMIT] delivery.updated',
      client ? '(single client)' : '(broadcast)',
      payload,
    );

    const data: DeliverySocketEvent & { version: number } = {
      version: Date.now(),
      ...payload,
    };

    if (client) {
      client.emit('delivery.updated', data);
    } else {
      this.server.emit('delivery.updated', data);
    }
  }
}
