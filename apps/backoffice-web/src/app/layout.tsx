import type { ReactNode } from 'react';
import { AppProvider } from '../providers/AppProvider';

export const metadata = {
  title: 'Admin Panel',
  description: 'Secure Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
