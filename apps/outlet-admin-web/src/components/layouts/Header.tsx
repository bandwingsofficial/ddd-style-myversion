'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  Store,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';

import { outletAuthService } from '@/features/auth/services/auth.service';
import { outletService } from '@/features/outlet/services/outletService';
import { useOutletProfile } from '@/features/outlet/hooks/useOutletProfile';
import { Outlet } from '@/features/outlet/types';

// Define the backend URL to match your Profile Page logic
const BACKEND_URL = 'https://api.dev.local:4000';

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /* ---------------- Outlet State ---------------- */
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loadingOutlet, setLoadingOutlet] = useState(true);

  /* ---------------- Fetch Outlet ---------------- */
  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const outletData = await outletService.getOutlet();
        setOutlet(outletData);
      } catch (error) {
        console.error('Failed to load outlet for header', error);
        setOutlet(null);
      } finally {
        setLoadingOutlet(false);
      }
    };

    fetchOutlet();
  }, []);

  /* ---------------- Fetch Profile Data ---------------- */
  const { profile, loading: loadingProfile } = useOutletProfile(
    outlet?.id ?? '',
  );

  const handleLogout = async () => {
    try {
      await outletAuthService.logout();
    } finally {
      router.replace('/auth/login');
    }
  };

  /**
   * Helper to format image URLs correctly
   */
  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${BACKEND_URL}/${path}`;
  };

  // Determine display name: Priority Profile Owner Name > Outlet Name > Default
  const displayName =
    profile?.ownerName || outlet?.name || 'Outlet Admin';

  const displayEmail =
    profile?.contactEmail || 'admin@caneandtender.com';

  const avatarLetter = (
    profile?.ownerName ||
    outlet?.name ||
    'O'
  )
    .charAt(0)
    .toUpperCase();

  // Use avatarUrl from backend profile
  const avatarImage = getImageUrl(profile?.avatarUrl);

  /**
   * Mobile sidebar trigger.
   *
   * The Sidebar component can listen for:
   * "outlet-admin-toggle-sidebar"
   *
   * No navigation/business logic is changed here.
   */
  const handleMenuClick = () => {
    window.dispatchEvent(new CustomEvent('outlet-admin-toggle-sidebar'));
  };

  const handleProfileClick = () => {
    setIsDropdownOpen((current) => !current);
  };

  return (
    <>
      <header className="outlet-admin-header" style={styles.header}>
        {/* Left Section */}
        <div className="header-left" style={styles.left}>
          <button
            type="button"
            className="header-menu-button"
            style={styles.menuButton}
            onClick={handleMenuClick}
            aria-label="Open navigation menu"
            aria-expanded={isDropdownOpen}
          >
            <Menu size={20} color="#64748b" />
          </button>

          <div
            className="header-search-container"
            style={styles.searchContainer}
          >
            <Search size={18} color="#94a3b8" />

            <input
              type="text"
              placeholder="Quick Search..."
              style={styles.searchInput}
              aria-label="Quick Search"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right" style={styles.right}>
          {/* Outlet Name Widget */}
          <div
            className="header-outlet-widget"
            style={styles.outletWidget}
          >
            <Store size={16} />

            <span className="header-outlet-name">
              {loadingOutlet
                ? 'Loading outlet...'
                : outlet?.name ?? 'Outlet not found'}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="header-icon-button"
            style={styles.iconButton}
            aria-label="Notifications"
          >
            <Bell size={20} color="#64748b" />
            <span style={styles.notificationDot}></span>
          </button>

          {/* Profile Dropdown */}
          <div
            className="header-profile-wrapper"
            style={styles.profileWrapper}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              type="button"
              className="header-user-trigger"
              style={styles.userInfoTrigger}
              onClick={handleProfileClick}
              aria-label="Open profile menu"
              aria-expanded={isDropdownOpen}
            >
              <div
                className="header-user-details"
                style={styles.userDetails}
              >
                <span style={styles.role}>
                  {loadingProfile ? '...' : displayName}
                </span>
              </div>

              <div
                className="header-avatar"
                style={styles.avatar}
              >
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                ) : (
                  avatarLetter
                )}
              </div>

              <ChevronDown
                className="header-chevron"
                size={16}
                color="#64748b"
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="header-profile-dropdown"
                  style={styles.dropdown}
                >
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownName}>
                      {displayName}
                    </p>

                    <p style={styles.dropdownEmail}>
                      {displayEmail}
                    </p>
                  </div>

                  <ul style={styles.dropdownList}>
                    <li
                      style={styles.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/profile');
                      }}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </li>
                  </ul>

                  <div style={styles.dropdownFooter}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={styles.dropdownLogoutBtn}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <style jsx>{`
        .outlet-admin-header {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .header-left,
        .header-right {
          min-width: 0;
        }

        .header-menu-button,
        .header-icon-button,
        .header-user-trigger {
          flex-shrink: 0;
        }

        .header-user-trigger {
          border: 0;
          background: transparent;
          font: inherit;
          color: inherit;
        }

        .header-icon-button {
          border: 0;
          background: transparent;
          padding: 0;
        }

        .header-outlet-name {
          min-width: 180px;
          max-width: 260px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header-profile-dropdown {
          max-width: calc(100vw - 24px);
          box-sizing: border-box;
        }

        @media (max-width: 1100px) {
          .header-left {
            gap: 16px !important;
          }

          .header-right {
            gap: 16px !important;
          }

          .header-search-container {
            width: 240px !important;
          }

          .header-outlet-name {
            min-width: 120px;
            max-width: 180px;
          }

          .header-user-details {
            max-width: 130px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (max-width: 900px) {
          .outlet-admin-header {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          .header-search-container {
            width: 200px !important;
          }

          .header-outlet-widget {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .header-user-details {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .outlet-admin-header {
            height: 64px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .header-left {
            gap: 8px !important;
          }

          .header-right {
            gap: 8px !important;
          }

          .header-search-container {
            display: none !important;
          }

          .header-outlet-widget {
            padding: 7px 10px !important;
            gap: 6px !important;
            max-width: 150px;
            min-width: 0;
          }

          .header-outlet-widget svg {
            flex-shrink: 0;
          }

          .header-outlet-name {
            min-width: 0;
            max-width: 105px;
            font-size: 12px;
          }

          .header-profile-wrapper {
            padding-left: 8px !important;
          }

          .header-avatar {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
            font-size: 16px !important;
          }

          .header-chevron {
            display: none;
          }

          .header-profile-dropdown {
            position: fixed !important;
            top: 60px !important;
            right: 10px !important;
            width: min(280px, calc(100vw - 20px)) !important;
          }
        }

        @media (max-width: 480px) {
          .outlet-admin-header {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .header-right {
            gap: 4px !important;
          }

          .header-outlet-widget {
            max-width: 120px;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .header-outlet-name {
            max-width: 78px;
            font-size: 11px;
          }

          .header-menu-button {
            padding: 7px !important;
          }

          .header-icon-button {
            width: 36px !important;
            height: 36px !important;
          }

          .header-avatar {
            width: 34px !important;
            height: 34px !important;
          }
        }

        @media (max-width: 360px) {
          .header-outlet-widget {
            max-width: 92px;
          }

          .header-outlet-name {
            max-width: 52px;
          }

          .header-icon-button {
            display: none !important;
          }

          .header-profile-wrapper {
            padding-left: 4px !important;
          }
        }
      `}</style>
    </>
  );
}

/* ---------------- Styles ---------------- */

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    height: '72px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },

  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    minWidth: 0,
  },

  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    width: '320px',
    gap: '10px',
    boxSizing: 'border-box',
  },

  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: '#334155',
    width: '100%',
    minWidth: 0,
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    minWidth: 0,
  },

  outletWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfeff',
    color: '#0369a1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    minWidth: 0,
    boxSizing: 'border-box',
  },

  iconButton: {
    position: 'relative',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },

  profileWrapper: {
    position: 'relative',
    paddingLeft: '16px',
    borderLeft: '1px solid #e2e8f0',
    flexShrink: 0,
  },

  userInfoTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: 0,
  },

  userDetails: {
    textAlign: 'right',
    minWidth: 0,
  },

  role: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
  },

  avatar: {
    height: '40px',
    width: '40px',
    borderRadius: '12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '18px',
    overflow: 'hidden',
    flexShrink: 0,
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    zIndex: 50,
    boxSizing: 'border-box',
  },

  dropdownHeader: {
    padding: '12px',
    borderBottom: '1px solid #f1f5f9',
  },

  dropdownName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '4px',
    overflowWrap: 'anywhere',
  },

  dropdownEmail: {
    fontSize: '12px',
    color: '#64748b',
    overflowWrap: 'anywhere',
  },

  dropdownList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },

  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#475569',
    transition: 'background 0.2s',
  },

  dropdownFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '8px',
  },

  dropdownLogoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};