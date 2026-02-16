export class OutletOrderResponseDto {
  id: string;
  orderNumber: string;
  customerFullName: string | null;
  grandTotal: number;
  itemCount: number;
  status: string;
  createdAt: Date;

  constructor(order: any) {
    this.id = order.id;
    this.orderNumber = order.orderNumber;
    this.customerFullName = order.customerFullName ?? null;
    this.grandTotal = order.grandTotal.toNumber();
    this.itemCount = order.itemCount;
    this.status = order.status;
    this.createdAt = order.createdAt;
  }
}
