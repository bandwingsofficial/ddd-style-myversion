"use client";

import React from "react";
import Link from "next/link"; // Import Link for navigation

export default function HomeBanner() {
  return (
    <section style={styles.homeBanner}>
      <div style={styles.container}>
        {/* Left Text Content */}
        <div style={styles.contentLeft}>
          <h1 style={styles.mainHeading}>
            Fresh, Hygienic, Live <br />
            Preparation. <br />
            Experience Purity.
          </h1>
          <p style={styles.description}>
            Savour the authentic taste of nature with our advanced cane and tender coconut platform, delivered fresh to your doorstep.
          </p>
          
          {/* Linked Button to /menu */}
          <Link href="/menu" style={{ textDecoration: 'none' }}>
            <button style={styles.ctaButton} className="cta-hover">
              Order Fresh Now
            </button>
          </Link>
        </div>

        {/* Right Image Content */}
        <div style={styles.imageRight}>
          <div style={styles.mainImageWrapper}>
            <img
              src="/images/banner.jpg"
              alt="Fresh Juice"
              style={styles.currentImage}
            />
          </div>
        </div>
      </div>

      {/* Adding a simple global style for the hover effect */}
      <style jsx>{`
        .cta-hover:hover {
          background-color: #16a34a !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  homeBanner: {
    background: "#ecfdf5",
    height: "calc(100vh - 72px)",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    marginTop: "72px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "2rem",
    alignItems: "center",
    width: "100%",
    padding: "0 2rem",
  },
  contentLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  mainHeading: {
    fontSize: "3.5rem",
    fontWeight: 800,
    color: "#1e293b",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  description: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: "1.6",
    maxWidth: "500px",
    margin: 0,
  },
  ctaButton: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "16px 32px",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "1.1rem",
    cursor: "pointer",
    width: "fit-content",
    transition: "all 0.2s ease", // Smooth transition for hover
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  imageRight: {
    display: "flex",
    justifyContent: "center",
  },
  mainImageWrapper: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  currentImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: "24px",
    transition: "transform 0.5s ease",
  }
};