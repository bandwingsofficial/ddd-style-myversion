import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ProductRepository } from '../repositories/product.repository';
import { PublicProductListDto } from '../dtos/public-product-list.dto';

@WebSocketGateway({
  namespace: '/public/products',
  cors: {
    origin: '*',
  },
})
export class ProductPublicGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly productRepo: ProductRepository,
  ) {}

  /* ================================================= */
  /* 🔥 SEND INITIAL DATA ON CLIENT CONNECT            */
  /* ================================================= */

  async handleConnection(client: Socket): Promise<void> {
    const products =
      await this.productRepo.findAll(); // ACTIVE only

    client.emit('products.updated', {
      products: products.map((p) =>
        PublicProductListDto.fromDomain(p),
      ),
    });
  }

  /* ================================================= */
  /* 🟢 FULL PRODUCT STATE (BROADCAST)                */
  /* ================================================= */

  emitProductsUpdated(payload: {
    products: any[];
  }): void {
    this.server.emit('products.updated', payload);
  }
}
