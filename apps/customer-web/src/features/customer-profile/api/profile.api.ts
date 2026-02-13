import customerAxios from "@/http/axios/customerAxios";
import { ProfileResponse } from "../types/profile.types";

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await customerAxios.get("/me/profile");
    return data;
  },

  // NEW: Method for initial creation
  createProfile: async (formData: FormData): Promise<ProfileResponse> => {
    const { data } = await customerAxios.post("/me/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Existing update method
  updateProfile: async (formData: FormData): Promise<ProfileResponse> => {
    const { data } = await customerAxios.patch("/me/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteProfile: async (): Promise<{ success: boolean }> => {
    const { data } = await customerAxios.delete("/me/profile");
    return data;
  }
};