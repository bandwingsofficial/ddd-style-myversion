import CustomerAuthProvider from "@/providers/CustomerAuthProvider";

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
