'use client';

import { useEffect } from 'react';
import { outletNotificationSoundService } from '../services/outlet-notification-sound.service';

/**
 * Plays new-order.mp3 while the outlet has orders in the New Orders (PAID) column.
 * Uses a single shared Audio instance and one notification loop app-wide.
 */
export function useNewOrderSound(pendingNewOrderCount: number): void {
  useEffect(() => {
    outletNotificationSoundService.preload();
    outletNotificationSoundService.attachUnlockListeners();

    return () => {
      outletNotificationSoundService.stop();
    };
  }, []);

  useEffect(() => {
    outletNotificationSoundService.syncPendingCount(pendingNewOrderCount);
  }, [pendingNewOrderCount]);
}

export function hasPendingNewOrders(count: number): boolean {
  return count > 0;
}
