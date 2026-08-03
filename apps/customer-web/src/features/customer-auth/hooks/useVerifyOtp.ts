import { verifyOtp } from "../api/auth.api";
import { syncAfterLogin } from "../services/auth-sync.service";

export const useVerifyOtp = () => {
  return async (phone: string, otp: string) => {
    await verifyOtp(phone, otp);
    await syncAfterLogin();
  };
};
