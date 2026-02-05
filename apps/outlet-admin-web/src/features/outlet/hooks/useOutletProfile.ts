'use client';

import { useEffect, useState } from 'react';
import { outletProfileService } from '../services/outletProfile.service';
import { OutletProfile } from '../types/outletProfile.types';

export function useOutletProfile(outletId: string) {
  const [profile, setProfile] = useState<OutletProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await outletProfileService.get(outletId);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outletId) fetchProfile();
  }, [outletId]);

  return { profile, loading, refresh: fetchProfile };
}
