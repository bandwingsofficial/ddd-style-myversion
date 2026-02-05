import customerAxios from "@/http/axios/customerAxios";
import { ProfileResponse, UpsertProfileRequest } from "../types/profile.types";

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await customerAxios.get("/me/profile");
    return data;
  },

  upsertProfile: async (payload: UpsertProfileRequest): Promise<ProfileResponse> => {
    const { data } = await customerAxios.post("/me/profile/upsert", payload);
    return data;
  },

  deleteProfile: async (): Promise<{ success: boolean }> => {
    const { data } = await customerAxios.delete("/me/profile");
    return data;
  }
};