import customerAxios from "@/http/axios/customerAxios";
import { Outlet } from "../outlet.type";

export const getPublicOutlets = async (): Promise<Outlet[]> => {
  // Matches: https://admin.dev.local:4000/public/outlets
  const res = await customerAxios.get("/public/outlets");
  return res.data.data;
};