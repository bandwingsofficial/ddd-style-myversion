"use client";

import { useEffect, useState } from "react";

export type TimerUrgency = "normal" | "warning" | "critical";

export function usePaymentTimer(
  paymentExpiresAt: string | null | undefined,
  remainingSecondsInitial?: number | null,
) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (typeof remainingSecondsInitial === "number") {
      return remainingSecondsInitial;
    }
    if (!paymentExpiresAt) return 0;
    return Math.max(
      0,
      Math.floor((new Date(paymentExpiresAt).getTime() - Date.now()) / 1000),
    );
  });

  useEffect(() => {
    if (!paymentExpiresAt) return;

    const tick = () => {
      const next = Math.max(
        0,
        Math.floor((new Date(paymentExpiresAt).getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(next);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paymentExpiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const urgency: TimerUrgency =
    remainingSeconds <= 60
      ? "critical"
      : remainingSeconds <= 180
        ? "warning"
        : "normal";

  const colorClass =
    urgency === "critical"
      ? "text-red-600"
      : urgency === "warning"
        ? "text-orange-600"
        : "text-slate-900";

  const ringClass =
    urgency === "critical"
      ? "ring-red-100 bg-red-50"
      : urgency === "warning"
        ? "ring-orange-100 bg-orange-50"
        : "ring-slate-100 bg-slate-50";

  const pulseLastMinute = urgency === "critical" && remainingSeconds > 0;

  return {
    remainingSeconds,
    formatted,
    isExpired: remainingSeconds <= 0,
    urgency,
    colorClass,
    ringClass,
    pulseLastMinute,
  };
}
