'use client';

import {
  CustomerDisplayInfo,
  CustomerContactInput,
  getCustomerDisplayInfo,
  resolveOrderCustomer,
} from '@/lib/customer-display';

interface CustomerContactDisplayProps {
  customer?: CustomerContactInput | null;
  order?: Parameters<typeof resolveOrderCustomer>[0];
  info?: CustomerDisplayInfo;
  className?: string;
  nameClassName?: string;
  phoneClassName?: string;
  compact?: boolean;
}

export function CustomerContactDisplay({
  customer,
  order,
  info,
  className = '',
  nameClassName = '',
  phoneClassName = '',
  compact = false,
}: CustomerContactDisplayProps) {
  const resolved =
    info ??
    (order ? resolveOrderCustomer(order) : getCustomerDisplayInfo(customer ?? {}));

  return (
    <div className={className}>
      <div className={`font-semibold ${nameClassName}`}>👤 {resolved.displayName}</div>
      {resolved.showPhoneLine ? (
        <div className={`${compact ? 'text-[10px]' : 'text-xs'} text-slate-600 ${phoneClassName}`}>
          📞 {resolved.phone}
        </div>
      ) : null}
    </div>
  );
}

/** Printable customer block for receipts and invoice previews. */
export function CustomerReceiptBlock({
  order,
}: {
  order: CustomerContactDisplayProps['order'];
}) {
  const info = resolveOrderCustomer(order ?? {});

  return (
    <section className="space-y-1 border-b border-dashed border-slate-300 pb-3 print:border-black">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">
        Customer
      </p>
      <CustomerContactDisplay info={info} nameClassName="text-sm text-slate-900" />
      {info.email ? (
        <p className="text-xs text-slate-600">{info.email}</p>
      ) : null}
    </section>
  );
}
