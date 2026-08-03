import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function Spinner({
  size = "md",
  label,
  className,
  fullPage = false,
}: SpinnerProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-emerald-600",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn("animate-spin", sizeMap[size])} aria-hidden />
      {label ? (
        <p className="text-sm font-semibold text-slate-600">{label}</p>
      ) : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[50vh] flex-grow items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
