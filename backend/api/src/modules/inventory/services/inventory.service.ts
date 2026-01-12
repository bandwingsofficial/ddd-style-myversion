import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { CentralInventoryRepository } from '../repositories/central-inventory.repository';
import { OutletStockRepository } from '../repositories/outlet-stock.repository';
import { StockTransactionRepository } from '../repositories/stock-transaction.repository';
import { StockItemRepository } from '../../stock-items/repositories/stock-item.repository';

import { CentralInventory } from '../domain/models/central-inventory.model';
import { OutletStock } from '../domain/models/outlet-stock.model';
import { StockTransaction } from '../domain/models/stock-transaction.model';

import { Quantity } from '../domain/value-objects/quantity.vo';
import { Unit } from '../../stock-items/domain/enums/unit.enum';

import { OutletRepository } from '../../outlets/repositories/outlet.repository';
import { OutletStatus } from '../../outlets/domain/enums/outlet-status.enum';

/* POLICIES */
import { InventoryActivePolicy } from '../policies/inventory-active.policy';
import { InventoryTransferPolicy } from '../policies/inventory-transfer.policy';
import { InventoryAdjustPolicy } from '../policies/inventory-adjust.policy';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryRepo: CentralInventoryRepository,
    private readonly outletStockRepo: OutletStockRepository,
    private readonly transactionRepo: StockTransactionRepository,
    private readonly stockItemRepo: StockItemRepository, // ✅ NEW
    private readonly outletRepo: OutletRepository,
  ) {}

  /* ================================================= */
  /* INTERNAL VALIDATION                               */
  /* ================================================= */

  private async ensureStockItemExists(stockItemId: string) {
    const stockItem =
      await this.stockItemRepo.findById(stockItemId);

    if (!stockItem) {
      throw new ValidationError(
        'INVALID_STOCK_ITEM_ID',
        'Stock item does not exist',
        { stockItemId },
      );
    }

    if (stockItem.status !== 'ACTIVE') {
      throw new ValidationError(
        'STOCK_ITEM_INACTIVE',
        'Stock item is inactive',
        { stockItemId },
      );
    }

    return stockItem;
  }
  /* ================================================= */
  /* INTERNAL VALIDATION                               */
  /* ================================================= */

  private async ensureOutletExists(outletId: string) {
  const outlet = await this.outletRepo.findById(outletId);

  if (!outlet) {
    throw new ValidationError(
      'INVALID_OUTLET_ID',
      'Outlet does not exist',
      { outletId },
    );
  }

  if (!outlet.isActive || outlet.status !== 'ACTIVE') {
    throw new ValidationError(
      'OUTLET_INACTIVE',
      'Outlet is inactive',
      { outletId },
    );
  }

  return outlet;
}

  /* ================================================= */
  /* INITIALIZE INVENTORY (ONCE PER STOCK ITEM)        */
  /* ================================================= */

  async initializeInventory(params: {
    stockItemId: string;
    unit: Unit;
    quantity: number;
    performedBy?: string;
  }): Promise<CentralInventory> {

    // ✅ EARLY VALIDATION (FIX)
    await this.ensureStockItemExists(params.stockItemId);

    const qty = Quantity.create(params.quantity);

    const exists =
      await this.inventoryRepo.existsByStockItemId(
        params.stockItemId,
      );

    if (exists) {
      throw new ValidationError(
        'INVENTORY_ALREADY_EXISTS',
        'Inventory already initialized for this stock item',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = CentralInventory.initialize({
        id: randomUUID(),
        stockItemId: params.stockItemId,
        unit: params.unit,
        initialQty: qty,
      });

      const created =
        await this.inventoryRepo.create(inventory, tx);

      const transaction = StockTransaction.initialize({
        id: randomUUID(),
        stockItemId: params.stockItemId,
        inventoryId: created.id,
        quantity: qty,
        performedBy: params.performedBy,
      });

      await this.transactionRepo.create(transaction, tx);

      return created;
    });
  }

  /* ================================================= */
  /* ADD STOCK (CENTRAL)                               */
  /* ================================================= */

  async addStock(params: {
    stockItemId: string;
    quantity: number;
    performedBy?: string;
    remarks?: string;
  }): Promise<CentralInventory> {

    // ✅ EARLY VALIDATION
    await this.ensureStockItemExists(params.stockItemId);

    const qty = Quantity.create(params.quantity);

    return this.prisma.$transaction(async (tx) => {
      const inventory =
        await this.inventoryRepo.findByStockItemId(
          params.stockItemId,
          tx,
        );

      if (!inventory) {
        throw new ValidationError(
          'INVENTORY_NOT_FOUND',
          'Inventory not found for stock item',
        );
      }

      InventoryActivePolicy.ensure(inventory);

      const updated = inventory.addStock(qty);

      await this.inventoryRepo.update(updated, tx);

      const transaction = StockTransaction.addStock({
        id: randomUUID(),
        stockItemId: params.stockItemId,
        inventoryId: inventory.id,
        quantity: qty,
        performedBy: params.performedBy,
        remarks: params.remarks,
      });

      await this.transactionRepo.create(transaction, tx);

      return updated;
    });
  }

  /* ================================================= */
  /* ADJUST AVAILABLE STOCK (ADMIN ONLY)               */
  /* ================================================= */

  async adjustAvailableStock(params: {
    stockItemId: string;
    newAvailableQty: number;
    performedBy?: string;
    remarks: string;
  }): Promise<CentralInventory> {

    // ✅ EARLY VALIDATION
    await this.ensureStockItemExists(params.stockItemId);

    const newQty = Quantity.create(params.newAvailableQty);

    return this.prisma.$transaction(async (tx) => {
      const inventory =
        await this.inventoryRepo.findByStockItemId(
          params.stockItemId,
          tx,
        );

      if (!inventory) {
        throw new ValidationError(
          'INVENTORY_NOT_FOUND',
          'Inventory not found for stock item',
        );
      }

      InventoryActivePolicy.ensure(inventory);
      InventoryAdjustPolicy.ensure(inventory, newQty);

      const updated =
        inventory.adjustAvailableStock(newQty);

      await this.inventoryRepo.update(updated, tx);

      const transaction = StockTransaction.adjust({
        id: randomUUID(),
        stockItemId: params.stockItemId,
        inventoryId: inventory.id,
        quantity: newQty,
        performedBy: params.performedBy,
        remarks: params.remarks,
      });

      await this.transactionRepo.create(transaction, tx);

      return updated;
    });
  }

  /* ================================================= */
  /* TRANSFER STOCK → OUTLET                           */
  /* ================================================= */

  async transferToOutlet(params: {
    stockItemId: string;
    outletId: string;
    quantity: number;
    performedBy?: string;
  }): Promise<{
    inventory: CentralInventory;
    outletStock: OutletStock;
  }> {

    // ✅ EARLY VALIDATION
    await this.ensureStockItemExists(params.stockItemId);
    await this.ensureOutletExists(params.outletId);

    const qty = Quantity.create(params.quantity);

    return this.prisma.$transaction(async (tx) => {
      const inventory =
        await this.inventoryRepo.findByStockItemId(
          params.stockItemId,
          tx,
        );

      if (!inventory) {
        throw new ValidationError(
          'INVENTORY_NOT_FOUND',
          'Inventory not found for stock item',
        );
      }

      InventoryActivePolicy.ensure(inventory);
      InventoryTransferPolicy.ensure(inventory, qty);

      /* 1️⃣ Reduce central inventory */
      const updatedInventory =
        inventory.transferOut(qty);

      await this.inventoryRepo.update(
        updatedInventory,
        tx,
      );

      /* 2️⃣ Add or create outlet stock */
      const existingOutletStock =
        await this.outletStockRepo.findByOutletAndStockItem(
          {
            outletId: params.outletId,
            stockItemId: params.stockItemId,
          },
          tx,
        );

      let outletStock: OutletStock;

      if (!existingOutletStock) {
        outletStock = OutletStock.createNew({
          id: randomUUID(),
          outletId: params.outletId,
          stockItemId: params.stockItemId,
          unit: inventory.unit,
          initialQty: qty,
        });

        await this.outletStockRepo.create(
          outletStock,
          tx,
        );
      } else {
        outletStock =
          existingOutletStock.addStock(qty);

        await this.outletStockRepo.update(
          outletStock,
          tx,
        );
      }

      /* 3️⃣ Transaction log */
      const transaction =
        StockTransaction.transferToOutlet({
          id: randomUUID(),
          stockItemId: params.stockItemId,
          inventoryId: inventory.id,
          outletId: params.outletId,
          quantity: qty,
          performedBy: params.performedBy,
        });

      await this.transactionRepo.create(transaction, tx);

      return {
        inventory: updatedInventory,
        outletStock,
      };
    });
  }

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getCentralInventory() {
    return this.inventoryRepo.findAll();
  }

  async getInventoryTransactions(stockItemId: string) {
    return this.transactionRepo.findAllByStockItem(
      stockItemId,
    );
  }

  async getOutletStock(outletId: string) {
    await this.ensureOutletExists(outletId);
    return this.outletStockRepo.findAllByOutlet(outletId);
  }

  
}
