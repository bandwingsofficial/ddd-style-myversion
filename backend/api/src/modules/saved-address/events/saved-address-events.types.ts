export interface SavedAddressLifecycleEvent {
  savedAddressId: string;
  customerId: string;
}

export interface SavedAddressUpdatedEvent {
  savedAddressId: string;
  customerId: string;
  label: string;
  addressText: string;
}
