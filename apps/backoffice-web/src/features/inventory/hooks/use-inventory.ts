"use client";

import { useEffect, useState } from "react";
import { InventoryAPI } from "../api/inventory.api";
import { InventoryItem } from "../types/inventory.types";

// Extend the type locally to include the stock name
export interface MergedInventoryItem extends InventoryItem {
  stockName?: string;
}

export function useInventory() {
  const [inventory, setInventory] = useState<MergedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetch both the central inventory and the stock items list
      const [inventoryRes, stocksRes] = await Promise.all([
        InventoryAPI.getCentralInventory(),
        InventoryAPI.getAllStockItems(),
      ]);

      const inventoryData = inventoryRes.data.data;
      const stocksData = stocksRes.data.data;

      // Merge: Match the inventory record with its corresponding stock item
      const mergedData = inventoryData.map((inv: InventoryItem) => {
        const matchingStock = stocksData.find((s: any) => s.id === inv.stockItemId);
        
        return {
          ...inv,
          // Use the name from stock table, fallback to ID
          stockName: matchingStock ? matchingStock.name : inv.stockItemId,
          // Force the status to match the stock item's real status
          status: matchingStock ? matchingStock.status : inv.status,
        };
      });

      setInventory(mergedData);
    } catch (error) {
      console.error("Failed to sync inventory and stock data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    refresh: fetchInventory,
  };
}