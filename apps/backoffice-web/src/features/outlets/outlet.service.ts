import { axiosInstance } from "@/http/axios";
import { WorkingStatus } from "./type";

export const OutletService = {
  getAll: async () => {
    const res = await axiosInstance.get("/outlets");
    return res.data.data;
  },

  create: async (payload: any) => {
    return axiosInstance.post("/outlets", payload);
  },

  //reset password for outlet user
   resetPassword: async (payload: {
    email: string;
    newPassword: string;
  }) => {
    return axiosInstance.post(
      "/outlets/users/reset-password",
      payload
    );
  },

   createUser: async (payload: {
    outletId: string;
    email: string;
    password: string;
    adminId: string;
  }) => {
    return axiosInstance.post("/outlets/users", payload);
  },

  isableUser: async (userId: string) => {
    return axiosInstance.post(
      `/outlets/users/${userId}/disable`
    );
  },

  enableUser: async (userId: string) => {
    return axiosInstance.post(
      `/outlets/users/${userId}/enable`
    );
  },

  update: async (id: string, payload: any) => {
    return axiosInstance.post(`/outlets/${id}/update`, payload);
  },

  disable: async (id: string) => {
    return axiosInstance.post(`/outlets/${id}/disable`);
  },

  enable: async (id: string) => {
    return axiosInstance.post(`/outlets/${id}/enable`);
  },

  updateWorkingStatus: async (
    id: string,
    status: WorkingStatus
  ) => {
    return axiosInstance.post(
      `/outlets/${id}/working-status`,
      { status }
    );
  },

  cameraOn: async (id: string, streamUrl: string) => {
    return axiosInstance.post(
      `/outlets/${id}/camera/on`,
      { streamUrl }
    );
  },

  cameraOff: async (id: string) => {
    return axiosInstance.post(
      `/outlets/${id}/camera/off`
    );
  },
};
