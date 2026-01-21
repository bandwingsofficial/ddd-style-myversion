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
    origin: true,
    credentials: true,
  },
})
export class CategoryPublicGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {
    console.log('🚀 CategoryPublicGateway initialized');
  }

  /* ================================================= */
  /* INITIAL CONNECT                                   */
  /* ================================================= */

  async handleConnection(client: Socket): Promise<void> {
    console.log('✅ category client connected:', client.id);
    await this.emitFullCategories(client);
  }

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH                             */
  /* ================================================= */

  async emitFullCategories(client?: Socket): Promise<void> {
    const categories =
      await this.categoryRepo.findAll(false);

    const payload = categories.map((c) => ({
      id: c.id,
      name: c.name,
      imagePath: c.imagePath,
      sortOrder: c.sortOrder,
    }));

    const data = {
      version: Date.now(),
      categories: payload,
    };

    if (client) {
      client.emit('categories.updated', data);
    } else {
      this.server.emit('categories.updated', data);
    }
  }
}
