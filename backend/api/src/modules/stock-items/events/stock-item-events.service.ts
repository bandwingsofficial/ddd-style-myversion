import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { StockItemEvents } from './stock-item-events.constants';
import {
  StockItemLifecycleEvent,
  StockItemUpdatedEvent,
  StockItemUnitChangedEvent,
} from './stock-item-events.types';

@Injectable()
export class StockItemEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitStockItemCreated(
    payload: StockItemLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      StockItemEvents.STOCK_ITEM_CREATED,
      payload,
    );
  }

  emitStockItemEnabled(
    payload: StockItemLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      StockItemEvents.STOCK_ITEM_ENABLED,
      payload,
    );
  }

  emitStockItemDisabled(
    payload: StockItemLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      StockItemEvents.STOCK_ITEM_DISABLED,
      payload,
    );
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  emitStockItemUpdated(
    payload: StockItemUpdatedEvent,
  ): void {
    this.eventEmitter.emit(
      StockItemEvents.STOCK_ITEM_UPDATED,
      payload,
    );
  }

  /* ================================================= */
  /* UNIT                                              */
  /* ================================================= */

  emitStockItemUnitChanged(
    payload: StockItemUnitChangedEvent,
  ): void {
    this.eventEmitter.emit(
      StockItemEvents.STOCK_ITEM_UNIT_CHANGED,
      payload,
    );
  }
}
