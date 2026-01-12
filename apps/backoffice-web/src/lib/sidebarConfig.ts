import {
  LayoutDashboard,
  BarChart3,
  Factory,
  Store,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  Users,
  UserCog,
  Coins,
  Settings,
  Database,
  ShieldCheck,
  BriefcaseBusiness,
  LogOut,
  ClipboardList,
  Warehouse,
  ArrowRightLeft,
} from "lucide-react"

export const sidebarConfig = [
  /* ================= DASHBOARD ================= */
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: [
      "superadmin",
      "companyadmin",
      "outletmanager",
      "inventoryclerk",
    ],
  },

  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    roles: ["superadmin", "companyadmin"],
  },

  /* ================= COMPANY & OUTLETS ================= */
  {
    section: "Company & Outlets",
    items: [
      {
        label: "Companies",
        icon: Factory,
        href: "/companies",
        roles: ["superadmin"],
      },
      {
        label: "Outlets",
        icon: Store,
        href: "/outlets",
        roles: ["superadmin", "companyadmin"],
      },
    ],
  },

  /* ================= PRODUCTS & INVENTORY ================= */
  {
    section: "Products & Inventory",
    items: [
      {
        label: "Stock Items",
        icon: Package,
        href: "/stock-items",
        roles: [
          "superadmin",
          "companyadmin",
          "inventoryclerk",
        ],
      },
      {
        label: "Central Inventory",
        icon: Warehouse,
        href: "/central-inventory",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Inventory Ledger",
        icon: ClipboardList,
        href: "/inventory/ledger",
        roles: [
          "superadmin",
          "companyadmin",
          "inventoryclerk",
        ],
      },
      {
        label: "Outlet Inventory",
        icon: Store,
        href: "/inventory/outlets",
        roles: [
          "superadmin",
          "companyadmin",
          "inventoryclerk",
        ],
      },
      {
        label: "Outlet Transfers",
        icon: ArrowRightLeft,
        href: "/inventory/outlets",
        roles: [
          "superadmin",
          "companyadmin",
          "inventoryclerk",
        ],
      },
    ],
  },

  /* ================= ORDERS & TENDERS ================= */
  {
    section: "Orders & Tenders",
    items: [
      {
        label: "Orders",
        icon: ShoppingBag,
        href: "/orders",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Tenders (Sugarcane & Coconut)",
        icon: BriefcaseBusiness,
        href: "/tenders",
        roles: [
          "superadmin",
          "companyadmin",
          "tendermanager",
        ],
      },
      {
        label: "Bids & Awards",
        icon: Coins,
        href: "/bids",
        roles: [
          "superadmin",
          "companyadmin",
          "tendermanager",
        ],
      },
    ],
  },

  /* ================= USERS & SECURITY ================= */
  {
    section: "Users & Roles",
    items: [
      {
        label: "All Users",
        icon: Users,
        href: "/users",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Roles & Permissions",
        icon: UserCog,
        href: "/roles",
        roles: ["superadmin"],
      },
      {
        label: "Audit Logs",
        icon: ShieldCheck,
        href: "/audit",
        roles: ["superadmin", "companyadmin"],
      },
    ],
  },

  /* ================= SYSTEM ================= */
  {
    section: "System Settings",
    items: [
      {
        label: "Admin Settings",
        icon: Settings,
        href: "/settings",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Database & Backups",
        icon: Database,
        href: "/database",
        roles: ["superadmin"],
      },
      {
        label: "Logout",
        icon: LogOut,
        href: "/logout",
        roles: [
          "superadmin",
          "companyadmin",
          "outletmanager",
          "inventoryclerk",
          "tendermanager",
        ],
      },
    ],
  },
]
