import CustomerAuthProvider from "@/providers/CustomerAuthProvider";
import LocationProvider from "@/providers/LocationProvider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Canten | Fresh Cane. Fresh Juice.",
    template: "%s | Canten",
  },

  description:
    "Canten brings quality products and convenient delivery right to your doorstep.",

  applicationName: "Canten",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Canten",
    description:
      "Shop quality products and get convenient delivery right to your doorstep.",
    type: "website",
    siteName: "Canten",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#166534",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CustomerAuthProvider>
          <LocationProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </LocationProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}