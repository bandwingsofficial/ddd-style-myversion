import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/public/stock-items',
  cors: {
    origin: '*', // tighten later if needed
  },
})
export class StockItemPublicGateway {
  @WebSocketServer()
  private readonly server: Server;

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitStockItemCreated(payload: {
    stockItemId: string;
  }): void {
    this.server.emit('stock_item.created', payload);
  }

  emitStockItemEnabled(payload: {
    stockItemId: string;
  }): void {
    this.server.emit('stock_item.enabled', payload);
  }

  emitStockItemDisabled(payload: {
    stockItemId: string;
  }): void {
    this.server.emit('stock_item.disabled', payload);
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  emitStockItemUpdated(payload: {
    stockItemId: string;
    name: string;
  }): void {
    this.server.emit('stock_item.updated', payload);
  }

  /* ================================================= */
  /* UNIT                                              */
  /* ================================================= */

  emitStockItemUnitChanged(payload: {
    stockItemId: string;
    unit: string;
  }): void {
    this.server.emit(
      'stock_item.unit.changed',
      payload,
    );
  }
}
