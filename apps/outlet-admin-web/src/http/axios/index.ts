import { api } from './instance';
import { requestInterceptor } from './request.interceptor';
import { responseInterceptor } from './response.interceptor';

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(
  responseInterceptor.onFulfilled,
  responseInterceptor.onRejected
);

export { api };
