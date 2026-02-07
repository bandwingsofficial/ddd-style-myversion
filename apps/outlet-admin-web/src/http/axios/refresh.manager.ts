import { api } from './instance';

let isRefreshing = false;
let queue: (() => void)[] = [];

export const refreshManager = async (): Promise<void> => {
  // 🚫 Do not refresh on auth pages
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/auth')
  ) {
    return Promise.reject('Refresh blocked on auth page');
  }

  if (isRefreshing) {
    return new Promise((resolve) => queue.push(resolve));
  }

  isRefreshing = true;

  try {
    await api.post('/auth/session/refresh');
    queue.forEach((cb) => cb());
    queue = [];
  } finally {
    isRefreshing = false;
  }
};
