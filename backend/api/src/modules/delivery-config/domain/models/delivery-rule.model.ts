import { ValidationError } from '../../../../common/errors';
import { DeliveryRuleStatus } from '../enums/delivery-rule-status.enum';

export interface DeliveryRuleProps {
  id: string;
  name: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  status: DeliveryRuleStatus;
  priority: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DeliveryRule {
  readonly id: string;
  readonly name: string;
  readonly minimumOrderAmount: number;
  readonly deliveryFee: number;
  readonly isFreeDelivery: boolean;
  readonly status: DeliveryRuleStatus;
  readonly priority: number;
  readonly description?: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: DeliveryRuleProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  static createNew(params: {
    id: string;
    name: string;
    minimumOrderAmount: number;
    deliveryFee: number;
    isFreeDelivery?: boolean;
    status?: DeliveryRuleStatus;
    priority: number;
    description?: string | null;
    now?: Date;
  }): DeliveryRule {
    const now = params.now ?? new Date();
    const isFreeDelivery =
      params.isFreeDelivery ?? params.deliveryFee === 0;

    return new DeliveryRule({
      id: params.id,
      name: params.name.trim(),
      minimumOrderAmount: params.minimumOrderAmount,
      deliveryFee: isFreeDelivery ? 0 : params.deliveryFee,
      isFreeDelivery,
      status: params.status ?? DeliveryRuleStatus.INACTIVE,
      priority: params.priority,
      description: params.description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: DeliveryRuleProps): DeliveryRule {
    return new DeliveryRule(props);
  }

  isActive(): boolean {
    return this.status === DeliveryRuleStatus.ACTIVE;
  }

  activate(now = new Date()): DeliveryRule {
    return new DeliveryRule({
      ...this.toProps(),
      status: DeliveryRuleStatus.ACTIVE,
      updatedAt: now,
    });
  }

  deactivate(now = new Date()): DeliveryRule {
    return new DeliveryRule({
      ...this.toProps(),
      status: DeliveryRuleStatus.INACTIVE,
      updatedAt: now,
    });
  }

  updateDetails(params: {
    name: string;
    minimumOrderAmount: number;
    deliveryFee: number;
    isFreeDelivery?: boolean;
    priority: number;
    description?: string | null;
    now?: Date;
  }): DeliveryRule {
    const isFreeDelivery =
      params.isFreeDelivery ?? params.deliveryFee === 0;

    return new DeliveryRule({
      ...this.toProps(),
      name: params.name.trim(),
      minimumOrderAmount: params.minimumOrderAmount,
      deliveryFee: isFreeDelivery ? 0 : params.deliveryFee,
      isFreeDelivery,
      priority: params.priority,
      description: params.description?.trim() || null,
      updatedAt: params.now ?? new Date(),
    });
  }

  toProps(): DeliveryRuleProps {
    return {
      id: this.id,
      name: this.name,
      minimumOrderAmount: this.minimumOrderAmount,
      deliveryFee: this.deliveryFee,
      isFreeDelivery: this.isFreeDelivery,
      status: this.status,
      priority: this.priority,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertValidState(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new ValidationError(
        'DELIVERY_RULE_INVALID_NAME',
        'Rule name must be at least 2 characters',
      );
    }

    if (this.minimumOrderAmount < 0) {
      throw new ValidationError(
        'DELIVERY_RULE_INVALID_MINIMUM',
        'Minimum order amount cannot be negative',
      );
    }

    if (this.deliveryFee < 0) {
      throw new ValidationError(
        'DELIVERY_RULE_INVALID_FEE',
        'Delivery fee cannot be negative',
      );
    }

    if (this.isFreeDelivery && this.deliveryFee !== 0) {
      throw new ValidationError(
        'DELIVERY_RULE_INVALID_FREE',
        'Free delivery rules must have zero delivery fee',
      );
    }

    if (!Number.isInteger(this.priority) || this.priority < 1) {
      throw new ValidationError(
        'DELIVERY_RULE_INVALID_PRIORITY',
        'Priority must be a positive integer',
      );
    }
  }
}
