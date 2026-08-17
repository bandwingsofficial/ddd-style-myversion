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
  revenue: {
    totalRevenue: number;
    todaysRevenue: number;
    yesterdayRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    productRevenue: number;
    deliveryChargesCollected: number;
    discountGiven: number;
    netRevenue: number;
    grossRevenue: number;
  };
  orders: {
    totalOrders: number;
    todaysOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    preparingOrders: number;
    outForDelivery: number;
    deliveredOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    averageOrderValue: number;
    averageBasketSize: number;
  };
  payments: {
    todaysPayments: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    paymentSuccessRate: number;
  };
  customers: {
    returningCustomers?: number;
    repeatPurchaseRate?: number;
    averageSpend?: number;
  };
  delivery: {
    averageDeliveryMinutes: number;
    fastestDeliveryMinutes: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    acceptanceRate: number;
    completionRate: number;
  };
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

export interface DashboardTopCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  units: number;
  growthPercent: number;
}

export interface DashboardApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  generatedAt?: string;
}
