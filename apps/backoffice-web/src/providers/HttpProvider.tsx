'use client';

import { PropsWithChildren } from 'react';

/**
 * Side-effect import
 * Initializes Axios instance + interceptors exactly once
 */
import '@/http/axios';

/**
 * HttpProvider
 *
 * - Initializes Axios interceptors
 * - No state
 * - No effects
 * - Safe with React StrictMode
 */
export function HttpProvider({
  children,
}: PropsWithChildren) {
  return <>{children}</>;
}
