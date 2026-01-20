"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ShinyText from '../styles/ShinyText'; 
import {
  ShoppingCart, // Changed from ShoppingBag to ShoppingCart
  User,
  LogOut,
  Settings,
  Heart,
  Search,
  Package,
  MapPin,
  ChevronDown
} from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import LocationSelector from "./LocationSelector";

export default function Header() {
  const { isAuthenticated } = useCustomerAuthStore();
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Menu", href: "/menu" },
    { name: "Categories", href: "/categories" },
    { name: "Offers", href: "/offers" },
  ];

  return (
    <>
      <style jsx global>{`
        /* --- 1. MARQUEE ANIMATION (SCROLLING TEXT) --- */
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          flex: 1; 
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          margin-right: 20px;
        }

        .marquee-content {
          display: inline-block;
          animation: marquee 20s linear infinite;
          padding-left: 100%; 
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        /* --- 2. NAVIGATION GLOW EFFECT --- */
        .main-nav-link {
          text-decoration: none;
          color: #334155; 
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px; 
          border-radius: 30px; 
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .main-nav-link:hover {
          background-color: rgba(34, 197, 94, 0.15); 
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3); 
          transform: translateY(-1px); 
        }

        .main-nav-link:hover .shiny-text {
          animation: none !important;
          background: none !important;
          -webkit-background-clip: border-box !important;
          background-clip: border-box !important;
          color: #15803d !important; 
          text-shadow: 0 0 1px rgba(21, 128, 61, 0.5);
        }

        /* --- 3. ENHANCED SIGN IN BUTTON HOVER --- */
        .enhanced-login-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #fff;
          padding: 8px 28px;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          letter-spacing: 0.02em;
          border: 1px solid rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }

        .enhanced-login-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.5);
          background: linear-gradient(135deg, #4ade80 0%, #15803d 100%); /* Brighter gradient on hover */
        }

        .enhanced-login-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* --- 4. SEARCH BAR HOVER & FOCUS EFFECTS --- */
        .search-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Hover State */
        .search-container:hover {
          background-color: #ffffff !important;
          border-color: #cbd5e1 !important; /* Darker Gray */
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Focus State (When typing) */
        .search-container:focus-within {
          background: #ffffff !important;
          border-color: #22c55e !important; /* Brand Green Border */
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15) !important; /* Green Glow Ring */
          transform: translateY(-1px);
        }

        /* --- 5. UTILITIES --- */
        .user-dropdown-container:hover .dropdown-panel {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(0) !important;
        }
        .nav-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.2s ease;
          cursor: pointer;
          color: #334155;
        }
        .nav-icon-btn:hover {
          background-color: #f1f5f9;
          color: #16a34a;
          transform: scale(1.1); /* Subtle zoom */
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 0.875rem;
          transition: background 0.2s ease;
        }
        .dropdown-item:hover {
          background: #f0fdf4;
          color: #16a34a;
        }
        .location-constraint {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .location-constraint > div, 
        .location-constraint > span,
        .location-constraint p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .location-constraint svg {
          display: none !important; 
        }
      `}</style>

      <header
        style={{
          ...styles.headerWrapper,
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.03)" : "none",
        }}
      >
        {/* --- 1. TOP DARK BAR (Height 36px) --- */}
        <div style={{
            ...styles.topBar,
            height: scrolled ? "0px" : "36px", 
            opacity: scrolled ? 0 : 1,
            overflow: 'hidden'
        }}>
          <div style={styles.topBarContainer}>
             
             {/* WRAPPED SHINY TEXT IN MARQUEE CONTAINER */}
             <div className="marquee-container">
               <div className="marquee-content">
                  <ShinyText
                    text="Fresh, Hygienic, Live Preparation. Experience Purity.   —   Order Fresh Now!"
                    color="#ffffff"      
                    shineColor="#4ade80"  
                    speed={3}            
                    direction="right"    
                    spread={50}          
                    yoyo={false}         
                    className="top-bar-shiny" 
                  />
               </div>
             </div>
          </div>
        </div>

        {/* --- 2. MAIN NAVIGATION --- */}
        <div style={{
            ...styles.mainHeader,
            height: scrolled ? "70px" : "90px",
        }}>
          <div style={styles.container}>
            
            <div style={styles.leftGroup}>
                <Link href="/home" style={styles.brand}>
                  <Image 
                    src="/images/4.png" 
                    alt="Cane & Tender" 
                    width={180} 
                    height={65} 
                    style={{ objectFit: 'contain', maxHeight: scrolled ? '55px' : '65px', transition: 'max-height 0.3s' }} 
                    priority
                    unoptimized={true}
                  />
                </Link>

                <nav style={styles.navLinks}>
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="main-nav-link">
                      <ShinyText
                        text={link.name}
                        speed={3} 
                        delay={0}
                        color="#334155" 
                        shineColor="#94a3b8" 
                        spread={120}
                        direction="left"
                        yoyo={false}
                        pauseOnHover={false}
                        className="shiny-text"
                      />
                    </Link>
                  ))}
                </nav>
            </div>

            <div style={styles.searchSection}>
              <div style={styles.searchBar} className="search-container">
                <Search size={18} color="#94a3b8" style={{ marginLeft: '12px' }} />
                <input
                  type="text"
                  placeholder="Search for fresh items..."
                  style={styles.searchInput}
                />
              </div>
            </div>

            <div style={styles.rightGroup}>
              <div style={styles.locationContainer}>
                <div style={styles.locationValueRow}>
                    <MapPin size={16} color="#16a34a" style={{marginRight: '4px'}} />
                    <div style={styles.locationTextWrapper} className="location-constraint">
                      <LocationSelector />
                    </div>
                    <ChevronDown size={14} color="#64748b" style={{marginLeft: '4px'}} />
                </div>
              </div>

              <div style={styles.actionRow}>
                <Link href="/favorites" className="nav-icon-btn" title="Favorites">
                  <Heart size={22} />
                </Link>

                <Link href="/cart" style={styles.cartLink} className="nav-icon-btn" title="Cart">
                  <div style={styles.cartWrapper}>
                    {/* UPDATED: Standard Shopping Cart Icon */}
                    <ShoppingCart size={22} />
                    <span style={styles.cartBadge}>3</span>
                  </div>
                </Link>

                {isAuthenticated ? (
                  <div className="user-dropdown-container" style={{ position: "relative" }}>
                    <div className="nav-icon-btn">
                      <User size={22} />
                    </div>
                    <div style={styles.dropdownPanel} className="dropdown-panel">
                      <div style={styles.dropdownHeader}>
                        <p style={styles.userName}>Alex Johnson</p>
                        <p style={styles.userEmail}>alex@example.com</p>
                      </div>
                      <hr style={styles.divider} />
                      <Link href="/profile" className="dropdown-item">
                        <User size={16} /> Profile
                      </Link>
                      <Link href="/orders" className="dropdown-item">
                        <Package size={16} /> My Orders
                      </Link>
                      <Link href="/settings" className="dropdown-item">
                        <Settings size={16} /> Settings
                      </Link>
                      <hr style={styles.divider} />
                      <button
                        onClick={() => logout()}
                        className="dropdown-item"
                        style={{
                          width: "100%",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                        }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  // Enhanced Login Button
                  <Link href="/login" className="enhanced-login-btn">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  headerWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    // UPDATED: Frosted Glass Effect (Premium)
    backgroundColor: "rgba(255, 255, 255, 0.85)", 
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    borderBottom: "1px solid rgba(241, 245, 249, 0.5)",
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    backgroundColor: "#214527", 
    width: "100%",
    display: "flex",
    justifyContent: "center",
    transition: "height 0.3s ease, opacity 0.3s ease",
  },
  topBarContainer: {
    maxWidth: "1440px",
    width: "100%",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  mainHeader: {
    width: "100%",
    // Background is handled by headerWrapper now for the glass effect
    backgroundColor: "transparent", 
    transition: "height 0.3s ease",
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    height: "100%",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  },
  brand: { textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px', 
  },
  searchSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center', 
    maxWidth: '600px', 
  },
  searchBar: {
    background: "#f8fafc",
    borderRadius: "50px",
    padding: "8px 16px 8px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    transition: "all 0.2s ease",
    border: "1px solid #e2e8f0",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    width: "100%",
    color: "#334155",
    fontWeight: 400,
    paddingLeft: "10px"
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  locationContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: '10px',
    maxWidth: '200px', 
  },
  locationValueRow: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  locationTextWrapper: {
    overflow: 'hidden',
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#334155",
  },
  actionRow: { display: "flex", alignItems: "center", gap: "12px" },
  cartLink: { textDecoration: "none", color: "inherit" },
  cartWrapper: { position: "relative", display: "flex", alignItems: "center" },
  cartBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#f97316",
    color: "white",
    fontSize: "10px",
    fontWeight: 700,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },
  dropdownPanel: {
    position: "absolute",
    top: "50px",
    right: 0,
    width: "240px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
    padding: "8px",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(10px)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1100,
  },
  dropdownHeader: { padding: "12px 12px 8px 12px" },
  userName: { margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" },
  userEmail: { margin: 0, fontSize: "0.75rem", color: "#64748b" },
  divider: { border: 0, borderTop: "1px solid #f1f5f9", margin: "6px 0" },
};