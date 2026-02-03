import axios from "axios";
import { attachRefreshInterceptor } from "@/http/interceptors/refresh.interceptor";

const customerAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-client-type": "web",
  },
});

// ✅ Attach interceptor AFTER instance creation
attachRefreshInterceptor(customerAxios);

export default customerAxios;
