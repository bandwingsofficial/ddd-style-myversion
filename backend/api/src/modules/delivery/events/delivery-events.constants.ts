export const DeliveryEvents = {
  DELIVERY_ASSIGNED: 'delivery.assigned',
  DELIVERY_PICKED_UP: 'delivery.picked_up',
  DELIVERY_IN_TRANSIT: 'delivery.in_transit', // ✅ ADD THIS
  DELIVERY_LOCATION_UPDATED: 'delivery.location.updated',
  DELIVERY_DELIVERED: 'delivery.delivered',
  DELIVERY_FAILED: 'delivery.failed',
} as const;
