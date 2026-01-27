import customerAxios from "@/http/axios/customerAxios";

export interface Address {
  id: string;
  customerId: string;
  type: "HOME" | "WORK" | "OTHER";
  label: string;
  addressText: string;
  latitude: number;
  longitude: number;
  isDeleted: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface AddressPayload {
  label?: string;
  type?: "HOME" | "WORK" | "OTHER";
  addressText: string;
  latitude: number;
  longitude: number;
}

export const AddressService = {
  getAll: async () => {
    const { data } = await customerAxios.get<ApiResponse<Address[]>>("/saved-addresses");
    return data.data;
  },

  getOne: async (id: string) => {
    const { data } = await customerAxios.get<ApiResponse<Address>>(`/saved-addresses/${id}`);
    return data.data;
  },

  create: async (payload: AddressPayload) => {
    const { data } = await customerAxios.post<ApiResponse<Address>>("/saved-addresses", payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<AddressPayload>) => {
    // ✅ CRITICAL FIX: Backend throws 400 if 'type' is present in update.
    // We must strip 'type' from the payload before sending it.
    const { type, ...cleanPayload } = payload;
    
    const { data } = await customerAxios.post<ApiResponse<Address>>(`/saved-addresses/${id}/update`, cleanPayload);
    return data.data;
  },

  delete: async (id: string) => {
    const { data } = await customerAxios.post<ApiResponse<{ deleted: boolean }>>(`/saved-addresses/${id}/delete`);
    return data.data;
  }
};