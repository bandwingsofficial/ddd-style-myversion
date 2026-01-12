import type { AxiosInstance } from 'axios';

/**
 * Single-flight refresh controller
 * Ensures only ONE refresh request happens at a time
 */

let isRefreshing = false;
let waitQueue: Array<() => void> = [];

function resolveQueue() {
  waitQueue.forEach((cb) => cb());
  waitQueue = [];
}

export async function refreshSession(
  axios: AxiosInstance,
): Promise<void> {
  if (isRefreshing) {
    return new Promise<void>((resolve) => {
      waitQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    await axios.post('/auth/session/refresh', null, {
      skipAuthRefresh: true, // 🔥 CRITICAL
    });
    resolveQueue();
  } finally {
    isRefreshing = false;
  }
}
