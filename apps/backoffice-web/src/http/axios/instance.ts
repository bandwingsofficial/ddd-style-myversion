import axios from 'axios';

/**
 * Central Axios instance
 * - Uses HttpOnly cookies
 * - Cross-subdomain auth (admin.dev.local ↔ api.dev.local)
 */
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // 🔑 REQUIRED
  timeout: 15000,
  headers: {
    'x-client-type': 'web', // required by backend
  },
});
