import customerAxios from "@/http/axios/customerAxios";

export const accountDeletionApi = {
  /** Authenticated: delete the logged-in customer's account (JWT only) */
  deleteAccount: async () => {
    const { data } = await customerAxios.delete("/me/account");
    return data;
  },

  /** Public: request deletion OTP for a phone number */
  requestPublicOtp: async (phone: string) => {
    const { data } = await customerAxios.post(
      "/auth/customer/account/deletion/otp/request",
      { phone },
    );
    return data;
  },

  /** Public: confirm deletion with phone + OTP */
  confirmPublic: async (phone: string, otp: string) => {
    const { data } = await customerAxios.post(
      "/auth/customer/account/deletion/confirm",
      { phone, otp },
    );
    return data;
  },
};
