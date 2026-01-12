import { axiosInstance } from './instance';
import { attachRequestInterceptor } from './request.interceptor';
import { attachResponseInterceptor } from './response.interceptor';

/**
 * Bootstrap axios interceptors
 * IMPORTANT: This must run exactly once
 */

// Request interceptor first
attachRequestInterceptor(axiosInstance);

// Response interceptor second
attachResponseInterceptor(axiosInstance);

export { axiosInstance };
