/** Enterprise Dashboard UI Tokens */

export const dashPageBg = '#FFFFFF';
export const dashSecondaryBg = '#FFFFFF';

export const dashBorder = '#E5EFE8';
export const dashPrimary = '#16A34A';
export const dashHover = '#22C55E';
export const dashLight = '#ECFDF3';

/* ---------------- Cards ---------------- */

export const dashCard =
  'rounded-2xl border border-[#E5EFE8] bg-gradient-to-b from-white via-[#FCFEFD] to-[#F6FCF8] shadow-[0_8px_24px_rgba(16,185,129,0.06)] transition-all duration-300';

export const dashCardInteractive =
  `${dashCard} hover:-translate-y-0.5 hover:border-[#BBF7D0] hover:shadow-[0_14px_28px_rgba(16,185,129,0.12)]`;

/* ---------------- Typography ---------------- */

export const dashSectionTitle =
  'text-base font-semibold tracking-tight text-slate-800';

export const dashSectionSubtitle =
  'text-xs text-slate-500';

/* ---------------- Filter Chips ---------------- */

export const dashFilterChip =
`
inline-flex
items-center
justify-center
h-9
rounded-full
border
border-[#E5EFE8]
bg-white
px-4
text-[13px]
font-semibold
text-slate-700
whitespace-nowrap
transition-all
duration-200
ease-out
shadow-sm
hover:border-[#86EFAC]
hover:bg-[#F5FFF8]
hover:text-[#15803D]
hover:shadow-md
active:scale-[0.98]
`;

export const dashFilterChipActive =
`
!bg-[#16A34A]
!border-[#16A34A]
!text-white
!shadow-[0_8px_18px_rgba(22,163,74,.28)]
hover:!bg-[#16A34A]
hover:!border-[#16A34A]
hover:!text-white
focus:!bg-[#16A34A]
focus:!border-[#16A34A]
focus:!text-white
`;

/* ---------------- Refresh ---------------- */

export const dashRefreshBtn =
`
inline-flex
items-center
justify-center
gap-2
h-9
rounded-xl
border
border-[#E5EFE8]
bg-white
px-4
text-sm
font-semibold
text-[#16A34A]
shadow-sm
transition-all
duration-200
hover:bg-[#16A34A]
hover:border-[#16A34A]
hover:text-white
hover:shadow-[0_8px_20px_rgba(22,163,74,.20)]
disabled:opacity-60
disabled:cursor-not-allowed
`;

/* ---------------- Tables ---------------- */

export const dashTableHead =
'sticky top-0 z-10 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500';

export const dashTableRow =
'border-t border-[#EEF4F0] transition-colors duration-200 hover:bg-[#F7FCF9]';

/* ---------------- Icons ---------------- */

export const dashIconWrap: Record<
  'emerald' | 'blue' | 'violet' | 'amber' | 'slate',
  string
> = {
  emerald:
    'bg-gradient-to-br from-[#ECFDF3] to-[#DDF8EA] text-emerald-600 shadow-sm',

  blue:
    'bg-gradient-to-br from-[#EFF6FF] to-[#E5EEFF] text-blue-600 shadow-sm',

  violet:
    'bg-gradient-to-br from-[#F5F3FF] to-[#ECE8FF] text-violet-600 shadow-sm',

  amber:
    'bg-gradient-to-br from-[#FFF8E8] to-[#FFF1CC] text-orange-500 shadow-sm',

  slate:
    'bg-gradient-to-br from-[#F8FAFC] to-[#EEF2F7] text-slate-600 shadow-sm',
};

/* ---------------- Lists ---------------- */

export const dashListItem =
'rounded-xl border border-[#E5EFE8] bg-gradient-to-b from-white to-[#F7FCF9] px-4 py-3 transition-all duration-300 hover:border-[#86EFAC] hover:bg-[#F5FFF8] hover:shadow-md';

/* ---------------- Inputs ---------------- */

export const dashInput =
'h-9 rounded-xl border border-[#E5EFE8] bg-white px-3 text-sm text-slate-700 shadow-sm transition-all duration-200 focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10';