import { verifyOtp } from "../api/auth.api";
import { useCustomerAuthStore } from "../store/auth.store";

export const useVerifyOtp = () => {
  const setSession = useCustomerAuthStore((s) => s.setSession);

  return async (phone: string, otp: string) => {
    const res = await verifyOtp(phone, otp);

    const { actorId, sessionId } = res.data.data;

    // ❌ DO NOT set tokens in frontend
    // Cookies are already set by backend

    setSession({
      actorId,
      sessionId,
    });
  };
};
