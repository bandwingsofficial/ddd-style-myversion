import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { InventoryOrchestratorService } from '../services/inventory-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { InitializeInventoryDto } from '../dtos/initialize-inventory.dto';
import { AddInventoryStockDto } from '../dtos/add-inventory-stock.dto';
import { AdjustInventoryStockDto } from '../dtos/adjust-inventory-stock.dto';
import { TransferInventoryStockDto } from '../dtos/transfer-inventory-stock.dto';

/* Domain */
import { Unit } from '../../stock-items/domain/enums/unit.enum';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class InventoryAdminController {
  constructor(
    private readonly orchestrator: InventoryOrchestratorService,
  ) {}

  /* ================================================= */
  /* INVENTORY – READS                                 */
  /* ================================================= */

  @Get()
  async getCentralInventory() {
    const data =
      await this.orchestrator.getCentralInventory();

    return {
      success: true,
      code: 'INVENTORY_FETCHED',
      message: 'Central inventory fetched successfully',
      data,
    };
  }
    /* ================================================= */
/* INVENTORY –  STOCK items                      */
/* ================================================= */

  @Get(':stockItemId/transactions')
  async getInventoryTransactions(
    @Param('stockItemId') stockItemId: string,
  ) {
    const data =
      await this.orchestrator.getInventoryTransactions(
        stockItemId,
      );

    return {
      success: true,
      code: 'INVENTORY_TRANSACTIONS_FETCHED',
      message: 'Inventory transactions fetched successfully',
      data,
    };
  }

  /* ================================================= */
/* INVENTORY – OUTLET STOCK                          */
/* ================================================= */

@Get('outlet/:outletId')
async getOutletStock(
  @Param('outletId') outletId: string,
) {
  const data =
    await this.orchestrator.getOutletStock(outletId);

  return {
    success: true,
    code: 'OUTLET_STOCK_FETCHED',
    message: 'Outlet stock fetched successfully',
    data,
  };
}

  /* ================================================= */
  /* INVENTORY – INITIALIZE                            */
  /* ================================================= */

  @Post('initialize')
  async initializeInventory(
    @Body() dto: InitializeInventoryDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.initializeInventory({
        stockItemId: dto.stockItemId,
        unit: dto.unit as Unit,
        quantity: dto.quantity,
        performedBy: user.id,
      });

    return {
      success: true,
      code: 'INVENTORY_INITIALIZED',
      message: 'Inventory initialized successfully',
      data,
    };
  }

  /* ================================================= */
  /* INVENTORY – ADD STOCK                             */
  /* ================================================= */

  @Post('add-stock')
  async addStock(
    @Body() dto: AddInventoryStockDto,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.addStock({
      stockItemId: dto.stockItemId,
      quantity: dto.quantity,
      remarks: dto.remarks,
      performedBy: user.id,
    });

    return {
      success: true,
      code: 'INVENTORY_STOCK_ADDED',
      message: 'Stock added successfully',
      data,
    };
  }

  /* ================================================= */
  /* INVENTORY – ADJUST AVAILABLE STOCK                */
  /* ================================================= */

  @Post('adjust-stock')
  async adjustAvailableStock(
    @Body() dto: AdjustInventoryStockDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.adjustAvailableStock({
        stockItemId: dto.stockItemId,
        newAvailableQty: dto.newAvailableQty,
        remarks: dto.remarks,
        performedBy: user.id,
      });

    return {
      success: true,
      code: 'INVENTORY_STOCK_ADJUSTED',
      message: 'Inventory stock adjusted successfully',
      data,
    };
  }

  /* ================================================= */
  /* INVENTORY – TRANSFER TO OUTLET                    */
  /* ================================================= */

  @Post('transfer')
  async transferToOutlet(
    @Body() dto: TransferInventoryStockDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.transferToOutlet({
        stockItemId: dto.stockItemId,
        outletId: dto.outletId,
        quantity: dto.quantity,
        performedBy: user.id,
      });

    return {
      success: true,
      code: 'INVENTORY_STOCK_TRANSFERRED',
      message: 'Stock transferred to outlet successfully',
      data,
    };
  }
}
