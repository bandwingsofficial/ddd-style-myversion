import type { Metadata } from 'next';
import '@/app/globals.css';
import AppProvider from '@/providers/AppProvider';
import HttpProvider from '@/providers/HttpProvider';

export const metadata: Metadata = {
  title: 'Outlet Admin',
  description: 'Outlet Admin Dashboard'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <HttpProvider>
          <AppProvider>{children}</AppProvider>
        </HttpProvider>
      </body>
    </html>
  );
}
