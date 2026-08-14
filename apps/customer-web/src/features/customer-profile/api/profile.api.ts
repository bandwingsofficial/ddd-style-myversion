import customerAxios from "@/http/axios/customerAxios";
import { ProfileResponse } from "../types/profile.types";

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await customerAxios.get("/me/profile");
    return data;
  },

  // Used only when a profile does not yet exist.
  // Phone is NOT sent from the frontend.
  // Backend gets it from the authenticated Customer.
  createProfile: async (formData: FormData): Promise<ProfileResponse> => {
    const { data } = await customerAxios.post("/me/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },

  // Phone is intentionally NOT included in the update FormData.
  updateProfile: async (formData: FormData): Promise<ProfileResponse> => {
    const { data } = await customerAxios.patch("/me/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },

  deleteProfile: async (): Promise<{ success: boolean }> => {
    const { data } = await customerAxios.delete("/me/profile");
    return data;
  },
};