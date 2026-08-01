export type DashboardPeriod =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'LAST_3_MONTHS'
  | 'LAST_6_MONTHS'
  | 'THIS_YEAR'
  | 'LAST_YEAR'
  | 'CUSTOM';

export interface DashboardFilters {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  outletId?: string;
  categoryId?: string;
  productId?: string;
  paymentStatus?: string;
  orderStatus?: string;
  topLimit?: number;
}

export interface DashboardSummary {
  filters: {
    period: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  revenue: Record<string, number>;
  orders: Record<string, number>;
  payments: Record<string, number>;
  customers: Record<string, number>;
  catalog: Record<string, number>;
  delivery: Record<string, number>;
}

export interface DashboardCharts {
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
  orderTrend: Array<{ date: string; orders: number }>;
  orderStatusDistribution: Record<string, number>;
  paymentStatusDistribution: Record<string, number>;
  averageOrderValueTrend: Array<{ date: string; value: number }>;
  customerMetrics: Record<string, number>;
  deliveryMetrics: Record<string, number>;
}

export interface DashboardRecentOrder {
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

export interface DashboardRecentPayment {
  id: string;
  transactionId: string | null;
  gateway: string;
  amount: number;
  status: string;
  attemptNo: number;
  paidAt: string | null;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string | null;
}

export interface DashboardTopProduct {
  productId: string;
  productName: string;
  productImage: string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  currentStock: string;
  trend: string;
  growthPercent: number;
}

export interface DashboardLowStockItem {
  stockItemId: string;
  name: string;
  unit: string;
  availableQty: number;
  totalQty: number;
  level: 'CRITICAL' | 'LOW' | 'OUT_OF_STOCK';
  status: string;
}

export interface DashboardTopOutlet {
  outletId: string;
  outletName: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface DashboardTopCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  units: number;
  growthPercent: number;
}
