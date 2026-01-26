import customerAxios from "@/http/axios/customerAxios";

// --- Types based on your Backend JSON ---
export interface Address {
  id: string;
  customerId: string;
  type: "HOME" | "WORK" | "OTHER";
  label: string;
  addressText: string;
  isDeleted: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

// --- Service Methods ---
export const AddressService = {
  getAll: async () => {
    const { data } = await customerAxios.get<ApiResponse<Address[]>>("/saved-addresses");
    return data.data;
  },

  create: async (payload: Pick<Address, "type" | "label" | "addressText">) => {
    const { data } = await customerAxios.post<ApiResponse<Address>>("/saved-addresses", payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<Address>) => {
    const { data } = await customerAxios.post<ApiResponse<Address>>(`/saved-addresses/${id}/update`, payload);
    return data.data;
  },

  delete: async (id: string) => {
    const { data } = await customerAxios.post<ApiResponse<{ deleted: boolean }>>(`/saved-addresses/${id}/delete`);
    return data.data;
  }
};