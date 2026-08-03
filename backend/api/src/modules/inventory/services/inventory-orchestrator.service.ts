import { Injectable } from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { Unit } from '../../stock-items/domain/enums/unit.enum';
import { InventoryResponseMapper } from '../mappers/inventory-response.mapper';

/**
 * Orchestrator = controller-facing layer
 * --------------------------------------------------
 * - Controllers talk ONLY to this class
 * - No domain logic
 * - No validation rules
 * - No data mutation
 * - Delegates to InventoryService
 */
@Injectable()
export class InventoryOrchestratorService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryResponseMapper: InventoryResponseMapper,
  ) {}

  /* ================================================= */
  /* INVENTORY – INITIALIZE                            */
  /* ================================================= */

  async initializeInventory(params: {
    stockItemId: string;
    unit: Unit;
    quantity: number;
    performedBy?: string;
  }) {
    const inventory = await this.inventoryService.initializeInventory(params);

    return this.inventoryResponseMapper.toResponse(inventory);
  }

  /* ================================================= */
  /* INVENTORY – ADD STOCK                             */
  /* ================================================= */

  async addStock(params: {
    stockItemId: string;
    quantity: number;
    performedBy?: string;
    remarks?: string;
  }) {
    const inventory = await this.inventoryService.addStock(params);

    return this.inventoryResponseMapper.toResponse(inventory);
  }

  /* ================================================= */
  /* INVENTORY – ADJUST AVAILABLE STOCK                */
  /* ================================================= */

  async adjustAvailableStock(params: {
    stockItemId: string;
    adjustmentType: 'ADD' | 'DEDUCT';
    adjustmentQuantity: number;
    performedBy?: string;
    remarks: string;
  }) {
    const inventory = await this.inventoryService.adjustAvailableStock(params);

    return this.inventoryResponseMapper.toResponse(inventory);
  }

  /* ================================================= */
  /* INVENTORY – TRANSFER TO OUTLET                    */
  /* ================================================= */

  async transferToOutlet(params: {
    stockItemId: string;
    outletId: string;
    quantity: number;
    performedBy?: string;
  }) {
    const result = await this.inventoryService.transferToOutlet(params);

    return {
      inventory: this.inventoryResponseMapper.toResponse(result.inventory),
    };
  }

  /* ================================================= */
  /* INVENTORY – READS                                 */
  /* ================================================= */

  async getCentralInventory() {
    const inventories = await this.inventoryService.getCentralInventory();

    return this.inventoryResponseMapper.toResponseList(inventories);
  }

  async getInventoryTransactions(stockItemId: string) {
    const transactions =
      await this.inventoryService.getInventoryTransactions(stockItemId);

    return this.inventoryResponseMapper.toTransactionResponseList(transactions);
  }

  async getOutletStock(outletId: string) {
    const outletStock = await this.inventoryService.getOutletStock(outletId);

    return this.inventoryResponseMapper.toOutletStockResponseList(outletStock);
  }
}
