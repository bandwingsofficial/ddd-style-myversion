'use client';

import { useEffect, useState, useCallback } from 'react';
import { outletProfileService } from '../services/outletProfile.service';
import { OutletProfile } from '../types/outletProfile.types';

export function useOutletProfile(outletId: string) {
  const [profile, setProfile] = useState<OutletProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    // Safety check: Don't call API if outletId is missing, empty, or literally the string "undefined"
    if (!outletId || outletId === 'undefined' || outletId === '') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await outletProfileService.get(outletId);
      setProfile(data);
    } catch (error) {
      console.error("Hook fetch error:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [outletId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refresh: fetchProfile };
}