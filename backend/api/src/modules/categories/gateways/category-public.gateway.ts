import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CategoryRepository } from '../repositories/category.repository';

@WebSocketGateway({
  namespace: '/public/categories',
  cors: {
    origin: '*',
  },
})
export class CategoryPublicGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  /* ================================================= */
  /* 🔥 SEND INITIAL DATA ON CLIENT CONNECT            */
  /* ================================================= */

  async handleConnection(client: Socket): Promise<void> {
    const categories =
      await this.categoryRepo.findAll(false); // ACTIVE only

    client.emit('categories.updated', {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle,          // ✅ ADDED
        imagePath: c.imagePath,        // ✅ ADDED

        // kept for backward compatibility
        status: c.status,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  }

  /* ================================================= */
  /* EXISTING EVENTS (UNCHANGED)                       */
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

  emitCategoryUpdated(payload: {
    categoryId: string;
    name?: string;
    subtitle?: string;
    imagePath?: string | null;
  }): void {
    this.server.emit('category.updated', payload);
  }

  emitCategorySortOrderChanged(payload: {
    categoryId: string;
    sortOrder: number;
  }): void {
    this.server.emit(
      'category.sort_order.changed',
      payload,
    );
  }

  /* ================================================= */
  /* 🟢 FULL CATEGORY STATE (BROADCAST)                */
  /* ================================================= */

  emitCategoriesUpdated(payload: {
    categories: {
      id: string;
      name: string;
      subtitle?: string;
      imagePath?: string | null;
      status: string;
      sortOrder: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): void {
    this.server.emit('categories.updated', payload);
  }
}
