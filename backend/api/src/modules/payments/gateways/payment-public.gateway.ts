import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { PaymentSocketEvent } from '../events/payment-events.types';

@WebSocketGateway({
  namespace: '/public/payments',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class PaymentPublicGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Server;

  constructor() {
    console.log(
      '🚀 [GATEWAY INIT] PaymentPublicGateway initialized',
    );
  }

  /* ================================================= */
  /* INITIAL CONNECT                                   */
  /* ================================================= */

  async handleConnection(client: Socket): Promise<void> {
    console.log(
      '✅ [SOCKET CONNECT] payment client connected:',
      client.id,
    );

    /**
     * Payments are lifecycle events only.
     * No historical snapshot required.
     */
  }

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH                             */
  /* ================================================= */

  async emitPaymentUpdate(
    payload: PaymentSocketEvent,
    client?: Socket,
  ): Promise<void> {
    console.log(
      '📡 [SOCKET EMIT] payment.updated',
      client ? '(single client)' : '(broadcast)',
      payload,
    );

    const data = {
      version: Date.now(),
      ...payload,
    };

    if (client) {
      client.emit('payment.updated', data);
      return;
    }

    this.server.emit('payment.updated', data);
  }
}
