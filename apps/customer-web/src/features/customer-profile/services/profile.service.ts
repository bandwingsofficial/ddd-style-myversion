// src/features/customer-profile/services/profile.service.ts
import { ProfileResponse, UpsertProfilePayload } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://admin.dev.local:4000";

// Helper to get auth headers
const getHeaders = () => {
  // ⚠️ Replace 'auth-storage' with the actual key used by your persist middleware in auth.store
  // Or fetch token directly from your store state if accessible here.
  const storage = localStorage.getItem("customer-auth-storage"); 
  let token = "";
  if (storage) {
    const parsed = JSON.parse(storage);
    token = parsed.state?.token || "";
  }

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const ProfileService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const res = await fetch(`${API_BASE_URL}/me/profile`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  },

  upsertProfile: async (payload: UpsertProfilePayload): Promise<ProfileResponse> => {
    const res = await fetch(`${API_BASE_URL}/me/profile/upsert`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save profile");
    return res.json();
  },

  deleteProfile: async (): Promise<ProfileResponse> => {
    const res = await fetch(`${API_BASE_URL}/me/profile`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete profile");
    return res.json();
  },
};