import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ProductOrchestratorService } from '../services/product-orchestrator.service';
import { PublicProductListDto } from '../dtos/public-product-list.dto';

@WebSocketGateway({
  namespace: '/public/products',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ProductPublicGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly orchestrator: ProductOrchestratorService,
  ) {
    console.log('🚀 ProductPublicGateway initialized');
  }

  /* ================================================= */
  /* INITIAL CONNECT                                   */
  /* ================================================= */

  async handleConnection(client: Socket): Promise<void> {
    console.log('✅ product client connected:', client.id);
    await this.emitFullProducts(client);
  }

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH                             */
  /* ================================================= */

  async emitFullProducts(client?: Socket): Promise<void> {
    const products =
      await this.orchestrator.getPublicProducts({});

    const payload = products.map(({ product, category }) =>
      PublicProductListDto.fromDomain(product, category),
    );

    const data = {
      version: Date.now(),
      products: payload,
    };

    if (client) {
      client.emit('products.updated', data);
    } else {
      this.server.emit('products.updated', data);
    }
  }
}
