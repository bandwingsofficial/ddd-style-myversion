import customerAxios from "@/http/axios/customerAxios";
import { canUseAuthenticatedApis } from "@/features/customer-auth/hooks/useCustomerSession";
import type { Address, AddressPayload, ApiResponse } from "./address.types";

export type { Address, AddressPayload, ApiResponse };

function assertAuthenticatedSession(): void {
  if (!canUseAuthenticatedApis()) {
    throw new Error("SESSION_NOT_READY");
  }
}

export const AddressService = {
  getAll: async (): Promise<Address[]> => {
    assertAuthenticatedSession();
    const { data } = await customerAxios.get<ApiResponse<Address[]>>(
      "/saved-addresses",
    );
    return data.data;
  },

  getOne: async (id: string): Promise<Address> => {
    assertAuthenticatedSession();
    const { data } = await customerAxios.get<ApiResponse<Address>>(
      `/saved-addresses/${id}`,
    );
    return data.data;
  },

  create: async (payload: AddressPayload): Promise<Address> => {
    assertAuthenticatedSession();
    const { data } = await customerAxios.post<ApiResponse<Address>>(
      "/saved-addresses",
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: Partial<AddressPayload>,
  ): Promise<Address> => {
    assertAuthenticatedSession();
    const { type, ...cleanPayload } = payload;
    const { data } = await customerAxios.post<ApiResponse<Address>>(
      `/saved-addresses/${id}/update`,
      cleanPayload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    assertAuthenticatedSession();
    const { data } = await customerAxios.post<ApiResponse<{ deleted: boolean }>>(
      `/saved-addresses/${id}/delete`,
    );
    return data.data;
  },
};
