"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-target",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:opacity-90",
        secondary:
          "bg-[#ECFDF5] text-brand-dark border border-[#BBF7D0] hover:bg-[#DCFCE7]",
        outline:
          "border border-surface-border bg-white text-ink-primary hover:bg-surface-unit",
        ghost:
          "text-ink-muted hover:bg-surface-unit hover:text-ink-primary",
        danger: "bg-red-600 text-white hover:bg-red-700",
        cart: "bg-brand text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-lg",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-sm",
        xl: "h-[3.25rem] px-8 text-base",
        icon: "h-10 w-10 rounded-full p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      if (process.env.NODE_ENV !== "production") {
        React.Children.only(children);
      }

      return (
        <Slot
          ref={ref as any}
          className={cn(
            buttonVariants({
              variant,
              size,
              fullWidth,
              className,
            }),
          )}
          aria-disabled={disabled || loading}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            className,
          }),
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };