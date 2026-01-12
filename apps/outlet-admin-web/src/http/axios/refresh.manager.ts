import { api } from './instance';

let isRefreshing = false;
let queue: (() => void)[] = [];

export const refreshManager = async (): Promise<void> => {
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
