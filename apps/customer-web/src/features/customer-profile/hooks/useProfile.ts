// src/features/customer-profile/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { ProfileService } from "../services/profile.service";
import { ProfileData, UpsertProfilePayload } from "../types";
import { toast } from "sonner"; // Assuming you use sonner or react-hot-toast. If not, standard alert works.

export const useProfile = (isAuthenticated: boolean) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Profile
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const response = await ProfileService.getProfile();
      // backend returns data: null if no profile exists
      setProfile(response.data); 
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial Load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Upsert (Create/Update)
  const saveProfile = async (payload: UpsertProfilePayload) => {
    try {
      setIsSaving(true);
      const response = await ProfileService.upsertProfile(payload);
      if (response.success && response.data) {
        setProfile(response.data);
        // toast.success("Profile saved successfully!"); 
        return true;
      }
      return false;
    } catch (error) {
      console.error("Save error:", error);
      // toast.error("Failed to save profile");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const deleteProfile = async () => {
    if (!confirm("Are you sure you want to delete your profile? This cannot be undone.")) return;
    
    try {
      setIsSaving(true);
      const response = await ProfileService.deleteProfile();
      if (response.success) {
        setProfile(null); // Reset local state
        // toast.success("Profile deleted");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    fetchProfile,
    saveProfile,
    deleteProfile
  };
};