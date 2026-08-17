"use client";

import {
  Check,
  CheckCircle2,
  ChefHat,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";

import {
  formatDateIST,
  formatTimeIST,
} from "@/lib/format-datetime";

interface Props {
  status: string;
  deliveredAt?: string | null;
}

type StepState = "completed" | "current" | "upcoming";

interface TimelineStep {
  title: string;
  icon: typeof Check;
  state: StepState;
}

function normalizeStatus(status: string): string {
  return status.toUpperCase();
}

function buildSteps(statusRaw: string): TimelineStep[] {
  const status = normalizeStatus(statusRaw);

  const rank = (value: string): number => {
    switch (value) {
      case "PAYMENT_PENDING":
      case "CREATED":
        return 0;
      case "PAID":
        return 1;
      case "CONFIRMED":
        return 2;
      case "PREPARING":
        return 3;
      case "READY_TO_DISPATCH":
        return 4;
      case "OUT_FOR_DELIVERY":
        return 5;
      case "DELIVERED":
        return 6;
      case "CANCELLED":
      case "FAILED":
        return -1;
      default:
        return 0;
    }
  };

  const currentRank = rank(status);

  const resolveState = (stepIndex: number): StepState => {
    if (currentRank < 0) {
      return "upcoming";
    }

    if (currentRank > stepIndex) {
      return "completed";
    }

    if (currentRank === stepIndex) {
      return "current";
    }

    return "upcoming";
  };

  const steps: TimelineStep[] = [
    {
      title: "Order Confirmed",
      icon: ShoppingBag,
      state:
        currentRank >= 1
          ? currentRank === 1
            ? "current"
            : "completed"
          : resolveState(1),
    },
    {
      title: "Accepted by Outlet",
      icon: Store,
      state: resolveState(2),
    },
    {
      title: "Preparing",
      icon: ChefHat,
      state: resolveState(3),
    },
    {
      title: "Ready",
      icon: Package,
      state: resolveState(4),
    },
    {
      title: "Out for Delivery",
      icon: Truck,
      state: resolveState(5),
    },
    {
      title: "Delivered",
      icon: CheckCircle2,
      state: status === "DELIVERED" ? "completed" : resolveState(6),
    },
  ];

  return steps;
}

function stepStyles(state: StepState, isDeliveredStep: boolean) {
  if (state === "completed") {
    return {
      circle: isDeliveredStep
        ? "h-14 w-14 bg-green-600 text-white ring-4 ring-green-100"
        : "h-10 w-10 bg-green-600 text-white",
      label: "font-semibold text-green-700",
      connector: "bg-green-500",
    };
  }

  if (state === "current") {
    return {
      circle:
        "h-10 w-10 bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse",
      label: "font-bold text-emerald-700",
      connector: "bg-emerald-300",
    };
  }

  return {
    circle: "h-10 w-10 bg-gray-100 text-gray-400",
    label: "font-medium text-gray-400",
    connector: "bg-gray-200",
  };
}

export default function OrderTracking({
  status,
  deliveredAt,
}: Props) {
  const normalized = normalizeStatus(status);
  const isDelivered = normalized === "DELIVERED";
  const isTerminalFailure =
    normalized === "CANCELLED" || normalized === "FAILED";
  const steps = buildSteps(status);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">Order Progress</h2>

        {isDelivered && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-700 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 size={14} />
            Delivered Successfully
          </span>
        )}
      </div>

      {isDelivered && (
        <div className="mb-8 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-200">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-green-800">
                ✓ Delivered Successfully
              </p>
              {deliveredAt && (
                <p className="mt-1 text-sm text-green-700">
                  Delivered on{" "}
                  <span className="font-semibold">
                    {formatDateIST(deliveredAt)}
                  </span>{" "}
                  at{" "}
                  <span className="font-semibold">
                    {formatTimeIST(deliveredAt)} IST
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isTerminalFailure ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          This order was {normalized.toLowerCase().replaceAll("_", " ")}.
        </p>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="flex items-start">
              {steps.map((step, index) => {
                const styles = stepStyles(
                  step.state,
                  step.title === "Delivered" && isDelivered,
                );
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="flex w-full items-center">
                      {index > 0 && (
                        <div
                          className={`h-1 flex-1 ${step.state === "upcoming" ? "bg-gray-200" : "bg-green-500"}`}
                        />
                      )}

                      <div
                        className={`flex shrink-0 items-center justify-center rounded-full transition-all ${styles.circle}`}
                      >
                        {step.state === "completed" ? (
                          <Check
                            size={
                              step.title === "Delivered" && isDelivered
                                ? 24
                                : 18
                            }
                          />
                        ) : (
                          <Icon size={18} />
                        )}
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`h-1 flex-1 ${steps[index + 1].state === "upcoming" ? "bg-gray-200" : "bg-green-500"}`}
                        />
                      )}
                    </div>

                    <p
                      className={`mt-3 text-center text-xs sm:text-sm ${styles.label}`}
                    >
                      {step.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-0 md:hidden">
            {steps.map((step, index) => {
              const styles = stepStyles(
                step.state,
                step.title === "Delivered" && isDelivered,
              );
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center rounded-full ${styles.circle}`}
                    >
                      {step.state === "completed" ? (
                        <Check size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`my-1 w-0.5 flex-1 min-h-[28px] ${step.state === "completed" ? "bg-green-500" : "bg-gray-200"}`}
                      />
                    )}
                  </div>

                  <div className="pb-6 pt-2">
                    <p className={`text-sm ${styles.label}`}>{step.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
