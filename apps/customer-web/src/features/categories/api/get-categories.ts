import customerAxios from "@/http/axios/customerAxios";
import { CategoryApiResponse } from "../types";

export const getCategories = async (): Promise<CategoryApiResponse> => {
  const response = await customerAxios.get<CategoryApiResponse>("/public/categories");
  return response.data;
};