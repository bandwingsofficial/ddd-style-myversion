export interface StockItemLifecycleEvent {
  stockItemId: string;
}

export interface StockItemUpdatedEvent {
  stockItemId: string;
  name: string;
}

export interface StockItemUnitChangedEvent {
  stockItemId: string;
  unit: string;
}
