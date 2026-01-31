/* ================================================= */
/* COMMON                                            */
/* ================================================= */

export interface DeliveryBaseEvent {
  deliveryId: string;
  orderId: string;
  riderId?: string;
  occurredAt: Date;
}

/* ================================================= */
/* LOCATION                                          */
/* ================================================= */

export interface DeliveryLocationEvent
  extends DeliveryBaseEvent {
  latitude: number;
  longitude: number;
}

/* ================================================= */
/* FAILED                                            */
/* ================================================= */

export interface DeliveryFailedEvent
  extends DeliveryBaseEvent {
  reason?: string;
}

/* ================================================= */
/* SOCKET EVENT TYPES                                */
/* ================================================= */

export type DeliverySocketEvent =
  | DeliveryBaseEvent
  | DeliveryLocationEvent
  | DeliveryFailedEvent;