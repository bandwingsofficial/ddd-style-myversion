"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomeBanner() {
  return (
    <section style={styles.homeBanner}>
      {/* --- BACKGROUND IMAGE (Forced to fill full width) --- */}
      <div style={styles.backgroundWrapper}>
        <Image
          src="/images/homebg.png"
          alt="Fresh Juice Ingredients Background"
          fill
          style={{ 
            // 'fill' forces the image to stretch to 100% width and height
            objectFit: "fill", 
            objectPosition: "bottom center"
          }}
          priority
          unoptimized
        />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div style={styles.container}>
        <div className="fade-in-up" style={styles.contentWrapper}>
          <h1 style={styles.mainHeading}>
            Freshness Delivered <span style={{ color: "#4ca82e" }}>Fast.</span>
          </h1>
          
          <p style={styles.description}>
            Natural, Healthy & Refreshing Sugarcane and Coconut Juices <br />
            Delivered to Your Doorstep.
          </p>

          <Link href="/menu" style={{ textDecoration: 'none' }}>
            <button className="order-button" style={styles.ctaButton}>
              Order Now
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .order-button {
          background: linear-gradient(to bottom, #74b72e, #2e7d32);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          z-index: 20;
        }

        .order-button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(76, 168, 46, 0.4);
          filter: brightness(1.1);
        }
      `}</style>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  homeBanner: {
    backgroundColor: "#ffffff", 
    height: "100vh", 
    width: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
  },
  backgroundWrapper: {
    position: "absolute",
    bottom: 0, 
    left: 0,
    width: "100%",
    height: "90%", // Keeps the splash from reaching the very top of the screen
    zIndex: 1, 
  },
  container: {
    position: "relative",
    zIndex: 10, 
    width: "100%",
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%", 
    paddingBottom: "35vh", // Pushes text higher to sit above the wider splash
  },
  contentWrapper: {
    textAlign: "center",
    padding: "0 20px",
  },
  mainHeading: {
    fontSize: "clamp(1.5rem, 5vw, 3rem)",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 10px 0",
    letterSpacing: "-1.5px",
    lineHeight: "1.1",
  },
  description: {
    fontSize: "1rem",
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "25px",
    fontWeight: 500,
  },
  ctaButton: {
    color: "white",
    border: "none",
    padding: "13px 34px",
    borderRadius: "50px",
    fontWeight: "bold",
    fontSize: "1rem",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
};