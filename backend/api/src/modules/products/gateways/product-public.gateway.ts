import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/public/products',
  cors: {
    origin: '*', // tighten later if needed
  },
})
export class ProductPublicGateway {
  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitProductCreated(payload: {
    productId: string;
  }): void {
    this.server.emit('product.created', payload);
  }

  emitProductEnabled(payload: {
    productId: string;
  }): void {
    this.server.emit('product.enabled', payload);
  }

  emitProductDisabled(payload: {
    productId: string;
  }): void {
    this.server.emit('product.disabled', payload);
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  emitProductUpdated(payload: {
    productId: string;
    name: string;
    slug: string;
  }): void {
    this.server.emit('product.updated', payload);
  }

  /* ================================================= */
  /* TRENDING                                          */
  /* ================================================= */

  emitProductTrendingChanged(payload: {
    productId: string;
    isTrending: boolean;
  }): void {
    this.server.emit(
      'product.trending.changed',
      payload,
    );
  }
}
