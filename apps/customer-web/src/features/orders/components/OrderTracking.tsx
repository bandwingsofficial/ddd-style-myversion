"use client";

import {
  CheckCircle,
  Package,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

interface Props {
  status: string;
}

export default function OrderTracking({
  status,
}: Props) {
  const current =
    status.toUpperCase();

  const steps = [
    {
      title: "Confirmed",
      active:
        [
          "PAID",
          "CONFIRMED",
          "PROCESSING",
          "PREPARING",
          "SHIPPED",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
        ].includes(current),
      icon: CheckCircle,
    },
    {
      title: "Preparing",
      active:
        [
          "PROCESSING",
          "PREPARING",
          "SHIPPED",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
        ].includes(current),
      icon: UtensilsCrossed,
    },
    {
      title: "Shipping",
      active:
        [
          "SHIPPED",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
        ].includes(current),
      icon: Truck,
    },
    {
      title: "Delivered",
      active:
        current ===
        "DELIVERED",
      icon: Package,
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h2 className="mb-8 text-lg font-bold">
        Order Progress
      </h2>

      <div className="flex items-center justify-between">
        {steps.map(
          (
            step,
            index,
          ) => (
            <div
              key={
                step.title
              }
              className="flex flex-1 flex-col items-center"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  step.active
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <step.icon
                  size={20}
                />
              </div>

              <p
                className={`mt-3 text-sm font-medium ${
                  step.active
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                {
                  step.title
                }
              </p>

              {index <
                steps.length -
                  1 && (
                <div className="mt-4 h-1 w-full bg-gray-200">
                  <div
                    className={`h-full ${
                      step.active
                        ? "bg-green-600"
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}