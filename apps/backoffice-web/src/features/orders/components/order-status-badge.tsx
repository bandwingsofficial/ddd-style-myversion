function toneForStatus(status: string) {
  const value = status.toUpperCase();

  if (['PAID', 'DELIVERED', 'SUCCESS'].includes(value)) {
    return 'bg-emerald-50 text-emerald-700';
  }
  if (['PREPARING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'PENDING'].includes(value)) {
    return 'bg-blue-50 text-blue-700';
  }
  if (['CANCELLED', 'FAILED', 'REJECTED'].includes(value)) {
    return 'bg-red-50 text-red-700';
  }
  return 'bg-slate-100 text-slate-700';
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${toneForStatus(status)}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
