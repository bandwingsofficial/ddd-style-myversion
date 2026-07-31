export type DeliveryRuleStatus = 'ACTIVE' | 'INACTIVE';

export interface DeliveryRule {
  id: string;
  name: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  status: DeliveryRuleStatus;
  priority: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRuleFormValues {
  name: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  priority: number;
  description?: string;
  activate?: boolean;
}
