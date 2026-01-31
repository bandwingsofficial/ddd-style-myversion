/* ================================================= */
/* DELIVERY EVENT TYPES (history tracking)           */
/* MUST MATCH Prisma enum DeliveryEventType          */
/* ================================================= */

export enum DeliveryEventType {
  ASSIGNED = 'ASSIGNED',

  PICKED_UP = 'PICKED_UP',

  IN_TRANSIT = 'IN_TRANSIT',

  DELIVERED = 'DELIVERED',

  FAILED = 'FAILED',

  LOCATION_UPDATED = 'LOCATION_UPDATED',
}
