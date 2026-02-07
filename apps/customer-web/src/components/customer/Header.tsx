"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ShinyText from '../styles/ShinyText'; 
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Heart,
  Search,
  Package,
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

  // ✅ UPDATED LOGIC: Base links for everyone
  const baseLinks = [
    { name: "Home", href: "/home" },
    { name: "Menu", href: "/menu" },
    { name: "Categories", href: "/categories" },
  ];

  // ✅ UPDATED LOGIC: Add "Orders" only if authenticated
  const navLinks = isAuthenticated 
    ? [...baseLinks, { name: "Orders", href: "/orders" }]
    : baseLinks;

  return (
    <>
      <style jsx global>{`
        :root {
          --brand-green: #22c55e;
          --brand-dark: #14532d;
          --text-primary: #1e293b;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.5);
        }

        /* --- 1. TOP BAR ANIMATIONS --- */
        .marquee-container { 
          overflow: hidden; 
          white-space: nowrap; 
          position: relative; 
          flex: 1; 
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); 
        }
        .marquee-content { 
          display: inline-block; 
          animation: marquee 20s linear infinite; 
          padding-left: 100%; 
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .top-bar-hover-effect:hover .marquee-content {
          animation-play-state: paused;
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        
        /* Shimmer Effect for Top Bar Background */
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* --- 2. LOGO MICRO-INTERACTION --- */
        .brand-logo-wrapper {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .brand-logo-wrapper:hover {
          transform: scale(1.05) rotate(-1deg);
          filter: drop-shadow(0 4px 6px rgba(34, 197, 94, 0.2));
        }

        /* --- 3. NAV LINKS (Underline Morph) --- */
        .main-nav-link { 
          text-decoration: none; 
          color: #475569; 
          font-weight: 500; 
          font-size: 0.95rem; 
          padding: 8px 12px; 
          position: relative;
          transition: color 0.3s ease; 
          display: flex; 
          align-items: center; 
        }
        .main-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0%;
          height: 2px;
          background-color: var(--brand-green);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
          border-radius: 2px;
        }
        .main-nav-link:hover { 
          color: var(--brand-dark); 
        }
        .main-nav-link:hover::after {
          width: 80%;
        }

        /* --- 4. SEARCH BAR (Apple Polish) --- */
        .search-container { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          width: 100%;
          max-width: 400px;
        }
        .search-container:hover { 
          background-color: #ffffff !important; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 2px rgba(0,0,0,0.02) !important; 
          transform: translateY(-1px);
        }
        .search-container:focus-within { 
          background: #ffffff !important; 
          border-color: var(--brand-green) !important; 
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15), 0 8px 20px rgba(0,0,0,0.05) !important; 
          max-width: 450px; /* Expands on focus */
        }
        .search-icon-anim {
          transition: transform 0.3s ease;
        }
        .search-container:focus-within .search-icon-anim {
          transform: scale(1.1);
          color: var(--brand-green) !important;
        }

        /* --- 5. LOCATION PULSE --- */
        .location-wrapper {
          position: relative;
          transition: transform 0.3s ease;
        }
        .location-wrapper:hover {
          transform: translateY(-1px);
        }
        /* Optional: Add a subtle pulse ring behind the location selector if desired */
        .location-wrapper::before {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100%; height: 100%;
          border-radius: 30px;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          animation: pulse-ring 3s infinite;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .location-wrapper:hover::before {
          opacity: 1;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        /* --- 6. ICONS & CART --- */
        .nav-icon-btn { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          width: 42px; 
          height: 42px; 
          border-radius: 50%; 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          cursor: pointer; 
          color: #334155; 
          background: transparent;
        }
        .nav-icon-btn:hover { 
          background-color: #f0fdf4; 
          color: var(--brand-green); 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
        }
        
        /* Wishlist Heart Pop */
        .heart-icon:hover {
          animation: heart-pop 0.4s ease-in-out;
        }
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        /* Cart Bounce */
        .cart-btn-wrapper:hover .cart-icon {
          animation: bounce 0.6s ease;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        /* Badge Wiggle */
        .cart-btn-wrapper:hover .cart-badge {
          animation: wiggle 1s ease-in-out;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        /* --- 7. BUTTONS & DROPDOWNS --- */
        .enhanced-login-btn { 
          background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); 
          color: #fff; 
          padding: 8px 24px; 
          border-radius: 50px; 
          font-size: 0.9rem; 
          font-weight: 600; 
          text-decoration: none; 
          transition: all 0.3s ease; 
          box-shadow: 0 4px 10px rgba(34, 197, 94, 0.25); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .enhanced-login-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4); 
          background: linear-gradient(135deg, #16a34a 0%, #14532d 100%); 
        }
        /* Ripple effect simulation on active */
        .enhanced-login-btn:active {
          transform: scale(0.98);
        }

        .user-dropdown-container:hover .dropdown-panel { 
          opacity: 1 !important; 
          visibility: visible !important; 
          transform: translateY(0) !important; 
        }
        .dropdown-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 10px 16px; 
          border-radius: 8px; 
          color: #475569; 
          text-decoration: none; 
          font-size: 0.875rem; 
          transition: all 0.2s ease; 
        }
        .dropdown-item:hover { 
          background: #f0fdf4; 
          color: var(--brand-green); 
          padding-left: 20px; /* Slight slide right */
        }
      `}</style>

      <header style={{ 
        ...styles.headerWrapper, 
        boxShadow: scrolled ? "0 10px 30px -10px rgba(0,0,0,0.08)" : "none",
        backgroundColor: scrolled ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.8)",
      }}>
        
        {/* TOP BAR */}
        <div className="top-bar-hover-effect" style={{ 
          ...styles.topBar, 
          height: scrolled ? "0px" : "36px", 
          opacity: scrolled ? 0 : 1,
          overflow: 'hidden'
        }}>
          <div style={styles.topBarContainer}>
             <div className="marquee-container">
               <div className="marquee-content">
                 🌱 Fresh, Hygienic and Natural Experience Purity. — <span style={{opacity: 0.8}}>Order Fresh Now!</span> &nbsp;&nbsp;&nbsp; 🥥 100% Natural Cane Juice &nbsp;&nbsp;&nbsp; ⚡ Delivery in 20 mins
               </div>
             </div>
          </div>
        </div>

        {/* MAIN NAV */}
        <div style={{ ...styles.mainHeader, height: scrolled ? "70px" : "85px" }}>
          <div style={styles.container}>
            
            <div style={styles.leftGroup}>
                <Link href="/home" style={styles.brand} className="brand-logo-wrapper">
                  <Image 
                    src="/images/4.png" 
                    alt="Cane & Tender" 
                    width={180} 
                    height={65} 
                    style={{ 
                      objectFit: 'contain', 
                      maxHeight: scrolled ? '50px' : '65px', 
                      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                    }} 
                    priority 
                    unoptimized={true} 
                  />
                </Link>
                <nav style={styles.navLinks}>
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="main-nav-link">
                        <ShinyText text={link.name} />
                    </Link>
                  ))}
                </nav>
            </div>

            {/* SEARCH SECTION */}
            <div style={styles.searchSection}>
              <div style={styles.searchBar} className="search-container">
                <Search 
                  size={18} 
                  className="search-icon-anim"
                  style={{ marginLeft: '14px', color: '#94a3b8' }} 
                />
                <input 
                  type="text" 
                  placeholder="Search for fresh items..." 
                  style={styles.searchInput} 
                />
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div style={styles.rightGroup}>
              
              {/* Location Selector */}
              <div style={styles.locationContainer} className="location-wrapper">
                  <LocationSelector />
              </div>

              <div style={styles.actionRow}>
                <Link href="/favorites" className="nav-icon-btn heart-icon">
                  <Heart size={20} strokeWidth={2.5} />
                </Link>
                
                <Link href="/cart" style={styles.cartLink} className="nav-icon-btn cart-btn-wrapper">
                  <div style={styles.cartWrapper}>
                    <ShoppingCart size={20} strokeWidth={2.5} className="cart-icon" />
                    <span style={styles.cartBadge} className="cart-badge">3</span>
                  </div>
                </Link>

                {isAuthenticated ? (
                  <div className="user-dropdown-container" style={{ position: "relative" }}>
                    <div className="nav-icon-btn"><User size={20} strokeWidth={2.5} /></div>
                    
                    {/* DROPDOWN PANEL */}
                    <div style={styles.dropdownPanel} className="dropdown-panel">
                      <div style={styles.dropdownHeader}>
                        <p style={styles.userName}>Hello there! 👋</p>
                        <p style={styles.userEmail}>Welcome back</p>
                      </div>
                      <hr style={styles.divider} />
                      <Link href="/profile" className="dropdown-item"><User size={16} /> Profile</Link>
                      <Link href="/my-orders" className="dropdown-item"><Package size={16} /> My Orders</Link>
                      <Link href="/settings" className="dropdown-item"><Settings size={16} /> Settings</Link>
                      <hr style={styles.divider} />
                      <button onClick={() => logout()} className="dropdown-item" style={{ width: "100%", border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="enhanced-login-btn">
                    <ShinyText text="Sign In" /> 
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
    backdropFilter: "blur(16px)", 
    WebkitBackdropFilter: "blur(16px)", 
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", 
    borderBottom: "1px solid rgba(255,255,255,0.3)", 
    display: 'flex', 
    flexDirection: 'column' 
  },
  
  // New Gradient Top Bar
  topBar: { 
    background: "linear-gradient(90deg, #166534, #22c55e, #166534)", 
    backgroundSize: "200% auto",
    animation: "shimmer 12s linear infinite",
    width: "100%", 
    display: "flex", 
    justifyContent: "center", 
    transition: "height 0.4s ease, opacity 0.3s ease" 
  },
  
  topBarContainer: { 
    maxWidth: "1440px", 
    width: "100%", 
    padding: "0 24px", 
    display: "flex", 
    alignItems: "center", 
    color: "#fff", 
    fontSize: "0.8rem", 
    fontWeight: 600,
    letterSpacing: "0.02em"
  },
  
  mainHeader: { 
    width: "100%", 
    backgroundColor: "transparent", 
    transition: "height 0.4s ease" 
  },
  
  container: { 
    maxWidth: "1440px", 
    margin: "0 auto", 
    height: "100%", 
    padding: "0 24px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: "20px" 
  },
  
  leftGroup: { display: 'flex', alignItems: 'center', gap: '32px' },
  brand: { textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" },
  navLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
  
  searchSection: { flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' },
  searchBar: { 
    background: "#f1f5f9", 
    borderRadius: "16px", 
    padding: "10px 4px", 
    display: "flex", 
    alignItems: "center", 
    border: "1px solid transparent",
    // Width and Shadow handled in CSS class for focus animation
  },
  searchInput: { 
    background: "transparent", 
    border: "none", 
    outline: "none", 
    fontSize: "0.95rem", 
    width: "100%", 
    color: "#334155", 
    fontWeight: 500, 
    paddingLeft: "12px" 
  },
  
  rightGroup: { display: 'flex', alignItems: 'center', gap: '24px' },
  
  locationContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    position: 'relative',
    paddingRight: '10px',
    borderRight: '1px solid #e2e8f0'
  },
  
  actionRow: { display: "flex", alignItems: "center", gap: "16px" },
  cartLink: { textDecoration: "none", color: "inherit" },
  cartWrapper: { position: "relative", display: "flex", alignItems: "center" },
  cartBadge: { 
    position: "absolute", 
    top: "-6px", 
    right: "-6px", 
    background: "#f97316", 
    color: "white", 
    fontSize: "10px", 
    fontWeight: 800, 
    width: "18px", 
    height: "18px", 
    borderRadius: "50%", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    border: "2px solid #fff",
    boxShadow: "0 2px 4px rgba(249, 115, 22, 0.3)"
  },
  
  dropdownPanel: { 
    position: "absolute", 
    top: "55px", 
    right: 0, 
    width: "260px", 
    background: "rgba(255, 255, 255, 0.95)", 
    backdropFilter: "blur(20px)",
    borderRadius: "16px", 
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)", 
    padding: "10px", 
    opacity: 0, 
    visibility: "hidden", 
    transform: "translateY(15px)", 
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", 
    zIndex: 1100 
  },
  dropdownHeader: { padding: "16px 16px 12px 16px" },
  userName: { margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" },
  userEmail: { margin: 0, fontSize: "0.8rem", color: "#64748b" },
  divider: { border: 0, borderTop: "1px solid #e2e8f0", margin: "8px 0" },
};