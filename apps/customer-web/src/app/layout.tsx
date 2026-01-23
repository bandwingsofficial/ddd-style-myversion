import CustomerAuthProvider from "@/providers/CustomerAuthProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <CustomerAuthProvider>
          {children}
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
