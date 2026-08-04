import { OrderDetails } from "@/features/checkout/checkout.types";

export interface OrderStatusBadge {
  label: string;
  className: string;
}

export function getOrderStatusBadge(order: OrderDetails): OrderStatusBadge {
  const display = order.displayStatus?.toLowerCase() ?? "";
  const status = order.status?.toUpperCase() ?? "";
  const paymentStatus = order.paymentStatus?.toUpperCase() ?? "";

  if (status === "PAYMENT_PENDING" && (order.remainingSeconds ?? 1) > 0) {
    return {
      label: "Payment Pending",
      className: "bg-amber-50 text-amber-800 ring-amber-100",
    };
  }

  if (
    status === "CANCELLED" &&
    (paymentStatus === "EXPIRED" || display.includes("expired"))
  ) {
    return {
      label: "Payment Expired",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  }

  switch (status) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        className: "bg-blue-50 text-blue-800 ring-blue-100",
      };
    case "PREPARING":
      return {
        label: "Preparing",
        className: "bg-violet-50 text-violet-800 ring-violet-100",
      };
    case "PAID":
      return {
        label: "Paid",
        className: "bg-emerald-50 text-emerald-800 ring-emerald-100",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out For Delivery",
        className: "bg-sky-50 text-sky-800 ring-sky-100",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-800 ring-emerald-100",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
      };
    default:
      return {
        label: order.displayStatus ?? status.replaceAll("_", " "),
        className: "bg-slate-100 text-slate-700 ring-slate-200",
      };
  }
}

export function isPendingPayment(order: OrderDetails): boolean {
  return (
    order.status?.toUpperCase() === "PAYMENT_PENDING" &&
    (order.remainingSeconds ?? 0) > 0
  );
}

export function isPaymentExpired(order: OrderDetails): boolean {
  const status = order.status?.toUpperCase() ?? "";
  if (status === "PAYMENT_PENDING" && (order.remainingSeconds ?? 0) <= 0) {
    return true;
  }
  return (
    status === "CANCELLED" &&
    (order.paymentStatus?.toUpperCase() === "EXPIRED" ||
      order.displayStatus?.toLowerCase().includes("expired") === true)
  );
}
