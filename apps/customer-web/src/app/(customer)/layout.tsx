"use client";

import WhatsAppButton from "@/components/whatsapp-icon/WhatsAppButton";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <WhatsAppButton />
    </>
  );
}