import CustomerAuthProvider from "@/providers/CustomerAuthProvider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import "./globals.css";

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