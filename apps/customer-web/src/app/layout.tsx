import CustomerAuthProvider from "@/providers/CustomerAuthProvider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import "./globals.css";
import type { Viewport } from "next";

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
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}