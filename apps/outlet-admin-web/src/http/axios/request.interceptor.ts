import { InternalAxiosRequestConfig } from 'axios';

export const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  // Do NOT touch headers or tokens
  // Cookies handled automatically
  return config;
};
