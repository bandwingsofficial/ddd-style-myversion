import { Injectable } from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { Unit } from '../../stock-items/domain/enums/unit.enum';

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
    return this.inventoryService.initializeInventory(
      params,
    );
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
    return this.inventoryService.addStock(params);
  }

  /* ================================================= */
  /* INVENTORY – ADJUST AVAILABLE STOCK                */
  /* ================================================= */

  async adjustAvailableStock(params: {
    stockItemId: string;
    newAvailableQty: number;
    performedBy?: string;
    remarks: string;
  }) {
    return this.inventoryService.adjustAvailableStock(
      params,
    );
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
    return this.inventoryService.transferToOutlet(
      params,
    );
  }

  /* ================================================= */
  /* INVENTORY – READS                                 */
  /* ================================================= */

  async getCentralInventory() {
    return this.inventoryService.getCentralInventory();
  }

  async getInventoryTransactions(stockItemId: string) {
    return this.inventoryService.getInventoryTransactions(
      stockItemId,
    );
  }

  async getOutletStock(outletId: string) {
    return this.inventoryService.getOutletStock(outletId);
  }
}
