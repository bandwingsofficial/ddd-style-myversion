import { DeliveryRule } from '../domain/models/delivery-rule.model';

export interface DeliveryRuleDto {
  id: string;
  name: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  status: string;
  priority: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class DeliveryRuleResponseMapper {
  static toDto(rule: DeliveryRule): DeliveryRuleDto {
    return {
      id: rule.id,
      name: rule.name,
      minimumOrderAmount: rule.minimumOrderAmount,
      deliveryFee: rule.deliveryFee,
      isFreeDelivery: rule.isFreeDelivery,
      status: rule.status,
      priority: rule.priority,
      description: rule.description ?? null,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }
}
