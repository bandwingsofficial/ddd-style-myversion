/** Shared design tokens — production customer web palette. */

export const colors = {
  primary: "#00A300",
  price: "#004700",
  discount: "#FF0000",
  trending: "#FFC800",
  background: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  description: "#6B7280",
  outlet: "#004700",
  unitBg: "#F3F4F6",
  unitText: "#6B7280",
} as const;

export const spacing = {
  pageX: "1rem",
  pageXSm: "1.25rem",
  pageXLg: "2rem",
  sectionY: "2rem",
  cardPadding: "0.75rem",
  stackSm: "0.375rem",
  stackMd: "0.75rem",
  stackLg: "1rem",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.625rem",
  card: "0.75rem",
  button: "0.5rem",
  badge: "0.375rem",
  full: "9999px",
} as const;

export const shadow = {
  card: "0 1px 3px 0 rgb(17 24 39 / 0.06)",
} as const;

export const layout = {
  touchMin: "2.75rem",
  productDetailSplit: "lg:grid-cols-[45%_55%]",
} as const;

export const typography = {
  pageTitle: "text-3xl sm:text-2xl font-bold leading-tight text-ink-primary",
  sectionTitle: "text-lg sm:text-xl font-bold text-ink-primary",
  cardTitle: "text-base font-bold leading-snug text-ink-primary",
  body: "text-md leading-relaxed text-ink-muted",
  caption: "text-xs text-ink-muted",
  priceLg: "text-2xl sm:text-[1.75rem] font-bold tabular-nums text-brand-price",
  priceCard: "text-base font-bold tabular-nums text-brand-price",
  priceStrike: "text-xs text-ink-muted line-through tabular-nums",
  discountText: "text-xs font-semibold text-brand-discount",
} as const;

export const productGrid = {
  cols: "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  imageHeight: "h-[170px] md:h-[220px]",
} as const;

export const badgeStyles = {
  tag:
  "inline-flex h-4 items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] font-semibold leading-none uppercase tracking-normal text-slate-700",
  outlet: "inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-brand-outlet",
  unit: "inline-flex items-center rounded-full bg-surface-unit px-2 py-0.5 text-[10px] font-medium uppercase text-ink-muted",
  trending:
    "inline-flex items-center gap-0.5 rounded-md bg-brand-trending px-1.5 py-0.5 text-[10px] font-bold text-white",
} as const;

export const buttonStyles = {
  add: "inline-flex h-8 min-w-[3.25rem] shrink-0 items-center justify-center gap-0.5 rounded-button bg-brand px-2.5 text-[11px] font-bold uppercase text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  addDetail:
    "inline-flex h-9 w-fit items-center justify-center rounded-button bg-brand px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  qty: "inline-flex h-8 shrink-0 items-center rounded-button bg-brand text-white",
  qtyBtn:
    "flex h-8 w-8 items-center justify-center text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
} as const;
