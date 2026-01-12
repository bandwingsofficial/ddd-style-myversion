export interface ProductLifecycleEvent {
  productId: string;
}

export interface ProductUpdatedEvent {
  productId: string;
  name: string;
  slug: string;
}

export interface ProductTrendingChangedEvent {
  productId: string;
  isTrending: boolean;
}
