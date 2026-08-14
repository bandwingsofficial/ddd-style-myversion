import type { ReactNode } from 'react';
import { AppProvider } from '../providers/AppProvider';
import './globals.css';

export const metadata = {
  title: 'Incredible Admin Panel',
  description: 'Secure and powerful administration dashboard for Incredible.',
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
