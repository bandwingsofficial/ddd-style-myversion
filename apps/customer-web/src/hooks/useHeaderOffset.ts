"use client";

import { useEffect, type RefObject } from "react";

/**
 * Keeps --customer-header-offset in sync with the live fixed header height
 * so page content never overlaps or leaves a gap (prevents CLS).
 */
export function useHeaderOffset(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const syncOffset = () => {
      const height = Math.ceil(element.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--customer-header-offset",
        `${height}px`,
      );
    };

    syncOffset();

    const resizeObserver = new ResizeObserver(() => {
      syncOffset();
    });
    resizeObserver.observe(element);

    window.addEventListener("orientationchange", syncOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("orientationchange", syncOffset);
    };
  }, [headerRef]);
}
