import { requestOtp } from "../api/auth.api";
import { normalizeIndianPhone } from "../utils/phoneNormalizer";

export const useRequestOtp = () => {
  return async (rawPhone: string) => {
    const phone = normalizeIndianPhone(rawPhone);
    const response = await requestOtp(phone);
    return response.data;
  };
};
