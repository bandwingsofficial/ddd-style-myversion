export interface AdminOrderListItem {
  id: string;
  orderNumber: string | null;
  customerName: string;
  customerPhone: string;
  outletName: string;
  itemCount: number;
  paymentStatus: string;
  orderStatus: string;
  amount: number;
  createdAt: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderTimelineEvent {
  type: string;
  label: string;
  at: string;
  note?: string | null;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  discountPrice?: number | null;
  lineTotal: number;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string | null;
  status: string;
  paymentStatus: string;
  outlet: { id: string; name: string };
  customer: {
    name: string;
    phone: string;
    email: string | null;
  };
  address: {
    label: string;
    addressText: string;
    latitude: number | null;
    longitude: number | null;
  };
  items: AdminOrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    netSubtotal: number;
    deliveryFee: number;
    grandTotal: number;
  };
  payment: {
    id: string;
    gateway: string | null;
    transactionId: string | null;
    method: string;
    status: string;
    paidAt: string | null;
    amount: number;
  } | null;
  cancellationReason: string | null;
  timeline: AdminOrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}
