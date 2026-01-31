/* ================================================= */
/* DELIVERY STATUS (Trip lifecycle)                  */
/* MUST MATCH Prisma enum DeliveryTripStatus         */
/* ================================================= */

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',

  PICKED_UP = 'PICKED_UP',

  IN_TRANSIT = 'IN_TRANSIT',

  DELIVERED = 'DELIVERED',

  FAILED = 'FAILED',
}
