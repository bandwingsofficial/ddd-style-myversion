"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Store,
  Package,
  ShoppingBag,
  History,
  X,
} from "lucide-react";

// Sidebar menu configuration
const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "My Outlet",
    href: "/my-outlet",
    icon: <Store size={20} />,
  },
  {
    label: "Products",
    href: "/products",
    icon: <Package size={20} />,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: <ShoppingBag size={20} />,
  },
  {
    label: "Order History",
    href: "/orders/history",
    icon: <History size={20} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /* ------------------------------------------------ */
  /* MOBILE SIDEBAR TOGGLE                            */
  /* ------------------------------------------------ */

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsMobileOpen((current) => !current);
    };

    window.addEventListener("outlet-admin-toggle-sidebar", handleToggleSidebar);

    return () => {
      window.removeEventListener(
        "outlet-admin-toggle-sidebar",
        handleToggleSidebar,
      );
    };
  }, []);

  /* ------------------------------------------------ */
  /* CLOSE ON ROUTE CHANGE                            */
  /* ------------------------------------------------ */

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  /* ------------------------------------------------ */
  /* ESCAPE KEY                                       */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  /* ------------------------------------------------ */
  /* PREVENT BODY SCROLL WHEN DRAWER IS OPEN          */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (!isMobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          className="sidebar-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`outlet-admin-sidebar ${
          isMobileOpen ? "mobile-sidebar-open" : ""
        }`}
        style={styles.sidebar}
        aria-label="Main navigation"
      >
        {/* Logo Area */}
        <div style={styles.brand}>
          <img src="/4.png" alt="Canten Logo" style={styles.logo} />

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-close-button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                style={
                  isActive
                    ? {
                        ...styles.link,
                        ...styles.activeLink,
                      }
                    : styles.link
                }
              >
                <span
                  style={
                    isActive
                      ? {
                          ...styles.icon,
                          color: "#4ade80",
                        }
                      : styles.icon
                  }
                >
                  {item.icon}
                </span>

                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div style={styles.footer}>
          <button type="button" style={styles.logoutButton}>
            <LogOut size={20} />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      <style jsx>{`
        .outlet-admin-sidebar {
          flex-shrink: 0;
        }

        .sidebar-mobile-backdrop {
          display: none;
        }

        .sidebar-close-button {
          display: none;
        }

        @media (max-width: 767px) {
          .outlet-admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: min(270px, 82vw) !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            z-index: 100 !important;

            transform: translateX(-100%);
            transition: transform 0.25s ease;
            will-change: transform;

            overflow-y: auto;
            overflow-x: hidden;
          }

          .outlet-admin-sidebar.mobile-sidebar-open {
            transform: translateX(0);
          }

          .sidebar-mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
            border: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 90;
            cursor: pointer;
          }

          .sidebar-close-button {
            display: flex;
            position: absolute;
            top: 16px;
            right: 14px;
            width: 38px;
            height: 38px;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
            cursor: pointer;
          }

          .sidebar-close-button:active {
            transform: scale(0.96);
          }

          .sidebar-link-label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (max-width: 360px) {
          .outlet-admin-sidebar {
            width: 82vw !important;
          }
        }

        @media (min-width: 768px) {
          .outlet-admin-sidebar {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: "270px",
    backgroundColor: "#012e22",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
    fontFamily: '"Inter", sans-serif',
    boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
    zIndex: 50,
    boxSizing: "border-box",
  },

  brand: {
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    position: "relative",
    flexShrink: 0,
  },

  logo: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 0 8px rgba(74, 222, 128, 0.3))",
  },

  nav: {
    flex: 1,
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: 0,
  },

  link: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "14px 20px",
    borderRadius: "12px",
    color: "#89a8a0",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 500,
    transition: "all 0.3s ease",
    gap: "14px",
    borderLeft: "4px solid transparent",
    boxSizing: "border-box",
    minWidth: 0,
  },

  activeLink: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    background:
      "linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0) 100%)",
    color: "#ffffff",
    borderLeft: "4px solid #4ade80",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.3s ease",
    flexShrink: 0,
  },

  footer: {
    padding: "24px",
    marginTop: "auto",
    flexShrink: 0,
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "14px",
    backgroundColor: "transparent",
    border: "1px solid #451a1a",
    borderRadius: "12px",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    transition: "all 0.2s ease",
    textTransform: "uppercase",
  },
};
