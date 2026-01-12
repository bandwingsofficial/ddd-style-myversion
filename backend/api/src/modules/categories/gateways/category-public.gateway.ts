import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/public/categories',
  cors: {
    origin: '*', // tighten later if needed
  },
})
export class CategoryPublicGateway {
  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitCategoryCreated(payload: {
    categoryId: string;
  }): void {
    this.server.emit('category.created', payload);
  }

  emitCategoryEnabled(payload: {
    categoryId: string;
  }): void {
    this.server.emit('category.enabled', payload);
  }

  emitCategoryDisabled(payload: {
    categoryId: string;
  }): void {
    this.server.emit('category.disabled', payload);
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  emitCategoryUpdated(payload: {
    categoryId: string;
    name: string;
  }): void {
    this.server.emit('category.updated', payload);
  }

  /* ================================================= */
  /* SORT ORDER                                        */
  /* ================================================= */

  emitCategorySortOrderChanged(payload: {
    categoryId: string;
    sortOrder: number;
  }): void {
    this.server.emit(
      'category.sort_order.changed',
      payload,
    );
  }
}
