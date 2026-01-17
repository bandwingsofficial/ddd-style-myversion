import CustomerAuthProvider from "@/providers/CustomerAuthProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerAuthProvider>
      {children}
    </CustomerAuthProvider>
  );
}
