'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/context/AuthContext';

type AppProviderProps = {
  children: ReactNode;
};

export default function AppProvider({ children }: AppProviderProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
