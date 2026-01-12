import { axiosInstance } from "@/http/axios";
import { CreateOutletUserPayload } from "./users.types";

export const UsersService = {
  getOutlets() {
    return axiosInstance.get("/outlets");
  },

  getUsersByOutlet(outletId: string) {
    return axiosInstance.get(`/outlets/${outletId}/users`);
  },

  createUser(payload: CreateOutletUserPayload) {
    return axiosInstance.post("/outlets/users", payload);
  },

  resetPassword(email: string, newPassword: string) {
    return axiosInstance.post("/outlets/users/reset-password", {
      email,
      newPassword,
    });
  },

  enableUser(userId: string) {
    return axiosInstance.post(`/outlets/users/${userId}/enable`);
  },

  disableUser(userId: string) {
    return axiosInstance.post(`/outlets/users/${userId}/disable`);
  },
};
