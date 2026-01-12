'use client';

import { ReactNode } from 'react';
import '@/http/axios'; // ensure interceptors are registered

export default function HttpProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
