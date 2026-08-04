import { Suspense } from "react";
import PendingPaymentClient from "./PendingPaymentClient";

export default async function PendingPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <PendingPaymentClient orderId={orderId} />
    </Suspense>
  );
}
