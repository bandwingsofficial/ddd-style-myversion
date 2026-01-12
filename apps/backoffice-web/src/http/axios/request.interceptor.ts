import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Request interceptor (Axios v1 safe)
 */
export function attachRequestInterceptor(
  axios: AxiosInstance,
) {
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!config.headers.get('x-client-type')) {
        config.headers.set('x-client-type', 'web');
      }

      if (process.env.NODE_ENV === 'development') {
        const finalUrl = config.baseURL
          ? `${config.baseURL}${config.url ?? ''}`
          : config.url;

        console.group(
          '%c[HTTP REQUEST]',
          'color:#2563eb;font-weight:bold',
        );
        console.log('URL:', finalUrl);
        console.log(
          'Method:',
          config.method?.toUpperCase(),
        );
        console.log(
          'withCredentials:',
          config.withCredentials,
        );
        console.groupEnd();
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
}
