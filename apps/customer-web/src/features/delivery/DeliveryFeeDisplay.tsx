interface DeliveryFeeDisplayProps {
  deliveryFee: number;
  remainingForFreeDelivery?: number | null;
  className?: string;
}

export function DeliveryFeeDisplay({
  deliveryFee,
  remainingForFreeDelivery,
  className = '',
}: DeliveryFeeDisplayProps) {
  const showFree = deliveryFee === 0;
  const remaining = remainingForFreeDelivery ?? null;

  return (
    <div className={className}>
      <div className="flex justify-between text-slate-500 text-sm">
        <span>Delivery Fee</span>
        <span
          className={
            showFree
              ? 'text-emerald-600 font-bold'
              : 'text-slate-700 font-medium'
          }
        >
          {showFree ? 'FREE' : `₹${deliveryFee}`}
        </span>
      </div>
      {!showFree && remaining != null && remaining > 0 && (
        <p className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          Add ₹{remaining} more to unlock free delivery.
        </p>
      )}
    </div>
  );
}
