import { Injectable } from '@nestjs/common';

import { DeliveryRuleService } from './delivery-rule.service';
import { DeliveryChargeService } from './delivery-charge.service';
import { DeliveryRuleResponseMapper } from '../mappers/delivery-rule-response.mapper';

@Injectable()
export class DeliveryConfigOrchestratorService {
  constructor(
    private readonly deliveryRuleService: DeliveryRuleService,
    private readonly deliveryChargeService: DeliveryChargeService,
  ) {}

  listRules() {
    return this.deliveryRuleService
      .listRules()
      .then((rules) => rules.map(DeliveryRuleResponseMapper.toDto));
  }

  getRuleById(ruleId: string) {
    return this.deliveryRuleService
      .getById(ruleId)
      .then(DeliveryRuleResponseMapper.toDto);
  }

  createRule(params: {
    name: string;
    minimumOrderAmount: number;
    deliveryFee: number;
    isFreeDelivery?: boolean;
    priority: number;
    description?: string;
    activate?: boolean;
  }) {
    return this.deliveryRuleService
      .createRule(params)
      .then(DeliveryRuleResponseMapper.toDto);
  }

  updateRule(params: {
    ruleId: string;
    name: string;
    minimumOrderAmount: number;
    deliveryFee: number;
    isFreeDelivery?: boolean;
    priority: number;
    description?: string;
  }) {
    return this.deliveryRuleService
      .updateRule(params)
      .then(DeliveryRuleResponseMapper.toDto);
  }

  activateRule(ruleId: string) {
    return this.deliveryRuleService
      .activateRule(ruleId)
      .then(DeliveryRuleResponseMapper.toDto);
  }

  deactivateRule(ruleId: string) {
    return this.deliveryRuleService
      .deactivateRule(ruleId)
      .then(DeliveryRuleResponseMapper.toDto);
  }

  deleteRule(ruleId: string) {
    return this.deliveryRuleService.deleteRule(ruleId);
  }

  getPublicConfig() {
    return this.deliveryChargeService.getPublicConfig();
  }

  previewCharge(params: {
    subtotal: number;
    netSubtotal?: number;
    discount?: number;
    itemCount?: number;
  }) {
    return this.deliveryChargeService.previewForTotals(params);
  }
}
