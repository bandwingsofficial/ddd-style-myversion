import { useCallback } from "react";
import { syncSessionOnBoot } from "../services/auth-sync.service";

export const useSession = () => {
  return useCallback(async () => {
    await syncSessionOnBoot();
  }, []);
};
