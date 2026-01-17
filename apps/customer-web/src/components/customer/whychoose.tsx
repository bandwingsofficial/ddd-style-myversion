"use client";

import React from "react";

// Realistic Pro Icons
const FarmFreshIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L9.5 7H4.5L8.5 11L7 16L12 13L17 16L15.5 11L19.5 7H14.5L12 2Z" fill="currentColor" opacity="0.2"/>
    <path d="M12 22C12 22 20 18 20 12C20 6.5 15.5 2 12 2C8.5 2 4 6.5 4 12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V12M12 12L17 7M12 12L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HygieneIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" opacity="0.1"/>
    <path d="M9 12L11 14L15 10M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LivePrepIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.1"/>
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const DeliveryIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3H1V16H16V3Z" fill="currentColor" opacity="0.1"/>
    <path d="M16 13H21L23 16V21H16V13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1" y="3" width="15" height="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const features = [
  { id: 1, title: "Farm Fresh", description: "Sourced directly from organic farms, ensuring peak flavor and nutrition.", icon: <FarmFreshIcon />, color: "#22c55e", bg: "#f0fdf4" },
  { id: 2, title: "Hygiene First", description: "Our preparation adheres to stringent hygiene protocols for your safety.", icon: <HygieneIcon />, color: "#0ea5e9", bg: "#f0f9ff" },
  { id: 3, title: "Live Preparation", description: "Experience the freshness - juices are prepared live and on-demand.", icon: <LivePrepIcon />, color: "#f59e0b", bg: "#fffbeb" },
  { id: 4, title: "Fast Delivery", description: "Enjoy your fresh beverages quickly with our efficient delivery service.", icon: <DeliveryIcon />, color: "#ef4444", bg: "#fef2f2" },
];

export default function WhyChooseUs() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>OUR PROMISE</span>
          <h2 style={styles.title}>Why Choose Us?</h2>
          <div style={styles.titleUnderline} />
        </div>

        <div style={styles.grid}>
          {features.map((feature) => (
            <div key={feature.id} style={styles.card} className="feature-card">
              <div style={{ ...styles.iconWrapper, color: feature.color, backgroundColor: feature.bg }}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .feature-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
        }
        .feature-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
          border-color: #22c55e !important;
        }
        .feature-card::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 3px;
          background: #22c55e;
          transition: all 0.3s ease;
          border-radius: 3px;
          transform: translateX(-50%);
        }
        .feature-card:hover::after {
          width: 40%;
        }
        @media (max-width: 1024px) {
          .grid-layout { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: {
    padding: "10px 0",
    backgroundColor: "#ffffff",
    backgroundImage: "linear-gradient(to bottom, #ffffff, #f8fafc)",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#22c55e",
    letterSpacing: "0.15em",
    marginBottom: "12px",
    background: "#dcfce7",
    padding: "4px 12px",
    borderRadius: "100px",
  },
  title: {
    fontSize: "2.75rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  titleUnderline: {
    width: "60px",
    height: "4px",
    background: "#22c55e",
    borderRadius: "2px",
    marginTop: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "30px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "48px 32px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "default",
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "28px",
    transition: "transform 0.3s ease",
  },
  featureTitle: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: "16px",
  },
  featureDescription: {
    fontSize: "1rem",
    color: "#64748b",
    lineHeight: "1.7",
    margin: 0,
    fontWeight: 400,
  },
};