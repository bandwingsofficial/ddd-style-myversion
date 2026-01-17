import axios from "axios";

const customerAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ✅ cookies only
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-client-type": "web",
  },
});

// ❌ REMOVE request interceptor completely
// ❌ DO NOT attach Authorization header

export default customerAxios;
