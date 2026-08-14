import type { Metadata } from 'next';
import '@/app/globals.css';
import AppProvider from '@/providers/AppProvider';
import HttpProvider from '@/providers/HttpProvider';
import { SonnerToaster } from '@/components/SonnerToaster';

export const metadata: Metadata = {
  title: 'Outlet Admin',
  description: 'Secure and powerful administration dashboard for Incredible.'
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
          <SonnerToaster />
        </HttpProvider>
      </body>
    </html>
  );
}
