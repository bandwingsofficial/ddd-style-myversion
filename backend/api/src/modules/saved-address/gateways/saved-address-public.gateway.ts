import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/public/saved-addresses',
  cors: {
    origin: '*', // tighten later
  },
})
export class SavedAddressPublicGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* CONNECTION LIFECYCLE                              */
  /* ================================================= */

  async handleConnection(client: Socket) {
    /**
     * Expect customerId from:
     * - auth token (preferred)
     * - or handshake query (temporary)
     */
    const customerId =
      client.handshake.auth?.customerId ||
      client.handshake.query?.customerId;

    if (!customerId) {
      client.disconnect(true);
      return;
    }

    client.join(this.customerRoom(customerId));

    client.emit('socket.connected', {
      customerId,
    });
  }

  handleDisconnect(client: Socket) {
    // Optional: cleanup / logging
  }

  /* ================================================= */
  /* ROOM HELPERS                                      */
  /* ================================================= */

  private customerRoom(customerId: string): string {
    return `customer:${customerId}`;
  }

  /* ================================================= */
  /* EVENTS                                            */
  /* ================================================= */

  emitSavedAddressCreated(payload: {
    savedAddressId: string;
    customerId: string;
  }): void {
    this.server
      .to(this.customerRoom(payload.customerId))
      .emit('saved_address.created', payload);
  }

  emitSavedAddressUpdated(payload: {
    savedAddressId: string;
    customerId: string;
    label: string;
    addressText: string;
  }): void {
    this.server
      .to(this.customerRoom(payload.customerId))
      .emit('saved_address.updated', payload);
  }

  emitSavedAddressDeleted(payload: {
    savedAddressId: string;
    customerId: string;
  }): void {
    this.server
      .to(this.customerRoom(payload.customerId))
      .emit('saved_address.deleted', payload);
  }
}
