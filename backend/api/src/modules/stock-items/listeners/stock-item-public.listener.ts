import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { StockItemEvents } from '../events/stock-item-events.constants';
import {
  StockItemLifecycleEvent,
  StockItemUpdatedEvent,
  StockItemUnitChangedEvent,
} from '../events/stock-item-events.types';

import { StockItemPublicGateway } from '../gateways/stock-item-public.gateway';

@Injectable()
export class StockItemPublicListener {
  constructor(
    private readonly gateway: StockItemPublicGateway,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  @OnEvent(StockItemEvents.STOCK_ITEM_CREATED)
  handleStockItemCreated(
    event: StockItemLifecycleEvent,
  ): void {
    this.gateway.emitStockItemCreated({
      stockItemId: event.stockItemId,
    });
  }

  @OnEvent(StockItemEvents.STOCK_ITEM_ENABLED)
  handleStockItemEnabled(
    event: StockItemLifecycleEvent,
  ): void {
    this.gateway.emitStockItemEnabled({
      stockItemId: event.stockItemId,
    });
  }

  @OnEvent(StockItemEvents.STOCK_ITEM_DISABLED)
  handleStockItemDisabled(
    event: StockItemLifecycleEvent,
  ): void {
    this.gateway.emitStockItemDisabled({
      stockItemId: event.stockItemId,
    });
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  @OnEvent(StockItemEvents.STOCK_ITEM_UPDATED)
  handleStockItemUpdated(
    event: StockItemUpdatedEvent,
  ): void {
    this.gateway.emitStockItemUpdated({
      stockItemId: event.stockItemId,
      name: event.name,
    });
  }

  /* ================================================= */
  /* UNIT                                              */
  /* ================================================= */

  @OnEvent(StockItemEvents.STOCK_ITEM_UNIT_CHANGED)
  handleStockItemUnitChanged(
    event: StockItemUnitChangedEvent,
  ): void {
    this.gateway.emitStockItemUnitChanged({
      stockItemId: event.stockItemId,
      unit: event.unit,
    });
  }
}
