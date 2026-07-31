import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ValidationError } from '../../../common/errors';

import { DeliveryRule } from '../domain/models/delivery-rule.model';
import { DeliveryRuleStatus } from '../domain/enums/delivery-rule-status.enum';
import { DeliveryRuleRepository } from '../repositories/delivery-rule.repository';

@Injectable()
export class DeliveryRuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryRuleRepo: DeliveryRuleRepository,
  ) {}

  async getById(ruleId: string): Promise<DeliveryRule> {
    const rule = await this.deliveryRuleRepo.findById(ruleId);
    if (!rule) {
      throw new ValidationError('DELIVERY_RULE_NOT_FOUND', 'Delivery rule not found');
    }
    return rule;
  }

  async listRules(): Promise<DeliveryRule[]> {
    return this.deliveryRuleRepo.findAll();
  }

  async createRule(params: {
    name: string;
    minimumOrderAmount: number;
    deliveryFee: number;
    isFreeDelivery?: boolean;
    priority: number;
    description?: string;
    activate?: boolean;
  }): Promise<DeliveryRule> {
    await this.assertUniquePriority(params.priority);
    await this.assertUniqueMinimumOrderAmount(params.minimumOrderAmount);

    const rule = DeliveryRule.createNew({
      id: randomUUID(),
      name: params.name,
      minimumOrderAmount: params.minimumOrderAmount,
      deliveryFee: params.deliveryFee,
      isFreeDelivery: params.isFreeDelivery,
      priority: params.priority,
      description: params.description,
      status: params.activate
        ? DeliveryRuleStatus.ACTIVE
        : DeliveryRuleStatus.INACTIVE,
    });

    return this.deliveryRuleRepo.create(rule);
  }

  async updateRule(params: {
    ruleId: string;
    name: string;
    minimumOrderAmount: number;
    deliveryFee: number;
    isFreeDelivery?: boolean;
    priority: number;
    description?: string;
  }): Promise<DeliveryRule> {
    const existing = await this.getById(params.ruleId);

    if (existing.priority !== params.priority) {
      await this.assertUniquePriority(params.priority, params.ruleId);
    }

    if (existing.minimumOrderAmount !== params.minimumOrderAmount) {
      await this.assertUniqueMinimumOrderAmount(
        params.minimumOrderAmount,
        params.ruleId,
      );
    }

    const updated = existing.updateDetails({
      name: params.name,
      minimumOrderAmount: params.minimumOrderAmount,
      deliveryFee: params.deliveryFee,
      isFreeDelivery: params.isFreeDelivery,
      priority: params.priority,
      description: params.description,
    });

    return this.deliveryRuleRepo.update(updated);
  }

  async activateRule(ruleId: string): Promise<DeliveryRule> {
    const rule = await this.getById(ruleId);
    if (rule.isActive()) {
      return rule;
    }
    return this.deliveryRuleRepo.update(rule.activate());
  }

  async deactivateRule(ruleId: string): Promise<DeliveryRule> {
    const rule = await this.getById(ruleId);
    if (!rule.isActive()) {
      return rule;
    }
    return this.deliveryRuleRepo.update(rule.deactivate());
  }

  async deleteRule(ruleId: string): Promise<{ id: string }> {
    await this.getById(ruleId);
    await this.deliveryRuleRepo.deleteById(ruleId);
    return { id: ruleId };
  }

  private async assertUniquePriority(
    priority: number,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.deliveryRuleRepo.findByPriority(priority);
    if (existing && existing.id !== excludeId) {
      throw new ValidationError(
        'DELIVERY_RULE_PRIORITY_EXISTS',
        'Another delivery rule already uses this priority',
        { priority },
      );
    }
  }

  private async assertUniqueMinimumOrderAmount(
    minimumOrderAmount: number,
    excludeId?: string,
  ): Promise<void> {
    const existing =
      await this.deliveryRuleRepo.findByMinimumOrderAmount(minimumOrderAmount);
    if (existing && existing.id !== excludeId) {
      throw new ValidationError(
        'DELIVERY_RULE_MINIMUM_EXISTS',
        'Another delivery rule already uses this minimum order amount',
        { minimumOrderAmount },
      );
    }
  }
}
