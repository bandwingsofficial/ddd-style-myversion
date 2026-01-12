import { Controller, Get, Param } from '@nestjs/common';

import { InventoryOrchestratorService } from '../services/inventory-orchestrator.service';

/**
 * Public Inventory Controller
 * --------------------------------------------------
 * - NO JWT
 * - NO Roles
 * - READ ONLY
 * - Safe for landing pages / customer apps
 */
@Controller('public/inventory')
export class InventoryPublicController {
  constructor(
    private readonly orchestrator: InventoryOrchestratorService,
  ) {}

  /* ================================================= */
  /* INVENTORY – PUBLIC LIST                           */
  /* ================================================= */

  /**
   * Central inventory (ACTIVE only)
   * Used for:
   * - Landing page
   * - Customer app
   */
  @Get()
  async getActiveInventory() {
    const data =
      await this.orchestrator.getCentralInventory();

    return {
      success: true,
      code: 'INVENTORY_PUBLIC_FETCHED',
      message: 'Inventory fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* INVENTORY – PUBLIC ITEM DETAILS                   */
  /* ================================================= */

  /**
   * Inventory details for a single stock item
   * (availability check)
   */
  @Get(':stockItemId')
  async getInventoryByStockItem(
    @Param('stockItemId') stockItemId: string,
  ) {
    const data =
      await this.orchestrator.getInventoryTransactions(
        stockItemId,
      );

    return {
      success: true,
      code: 'INVENTORY_ITEM_FETCHED',
      message: 'Inventory item fetched successfully',
      data,
    };
  }
}
