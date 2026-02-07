"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomeBanner() {
  const slides = [
    {
      id: 1,
      image: "/images/homebg5.png",
      badge: "100% Electrolytes",
      title: "Nature’s Purest \nEnergy Drink",
      desc: "Fresh tender coconut water, splashed with natural goodness. No preservatives, just pure hydration.",
      color: "#84cc16",
      gradient: "linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)",
      shadow: "rgba(132, 204, 22, 0.4)"
    },
    {
      id: 2,
      image: "/images/homebg2.png",
      badge: "Zesty & Fresh",
      title: "Twist of Lime, \nSip of Heaven",
      desc: "Experience the perfect balance of sweetness and citrus. Hand-crafted mocktails delivered fresh.",
      color: "#16a34a",
      gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
      shadow: "rgba(22, 163, 74, 0.4)"
    },
    {
      id: 3,
      image: "/images/homebg3.png",
      badge: "Raw & Organic",
      title: "Golden Sticks of \nSweetness",
      desc: "Authentic sugarcane juice extracted hygienically. A traditional boost of immunity and taste.",
      color: "#eab308",
      gradient: "linear-gradient(135deg, #facc15 0%, #a16207 100%)",
      shadow: "rgba(234, 179, 8, 0.4)"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];

  return (
    <section style={styles.homeBanner}>
      {/* Background Decor (Pulsing Blobs) */}
      <div className="blob-pulse" style={styles.backgroundBlobLeft} />
      <div className="blob-pulse delay" style={styles.backgroundBlobRight} />

      <div style={styles.container}>
        
        {/* --- LEFT CONTENT (TEXT) --- */}
        <div style={styles.contentLeft}>
          {/* Key forces re-render of animations on slide change */}
          <div key={activeSlide.id} style={styles.textWrapper}>
            
            {/* Glass Badge */}
            <div className="slide-up-1" style={{
              ...styles.badge, 
              color: activeSlide.color, 
              borderColor: activeSlide.color 
            }}>
              <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>•</span> 
              {activeSlide.badge}
            </div>

            {/* Headline with Gradient Text */}
            <h1 className="slide-up-2" style={styles.mainHeading}>
              {activeSlide.title.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {i === 1 ? (
                    <span style={{ 
                      backgroundImage: activeSlide.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="slide-up-3" style={styles.description}>
              {activeSlide.desc}
            </p>
            
            {/* CTA Button */}
            <div className="slide-up-4">
              <Link href="/menu" style={{ textDecoration: 'none' }}>
                <button 
                  style={{ ...styles.ctaButton, background: activeSlide.gradient }} 
                  className="cta-button"
                >
                  Shop Now
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT (IMAGE) --- */}
        <div style={styles.imageRight}>
          
          {/* The Glowing Aura */}
          <div style={{
            ...styles.imageGlow,
            background: `radial-gradient(circle, ${activeSlide.color}30 0%, rgba(255,255,255,0) 70%)`
          }} />

          {/* Image Container */}
          <div style={styles.imageWrapper}>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={currentSlide === index ? "floating-image" : ""}
                style={{
                  ...styles.imageSlide,
                  opacity: currentSlide === index ? 1 : 0,
                  transform: currentSlide === index 
                    ? "scale(1) translateX(0) rotate(0deg)" 
                    : "scale(0.8) translateX(100px) rotate(10deg)",
                  zIndex: currentSlide === index ? 2 : 1,
                  // CSS Filter to add 3D drop shadow to the PNG content itself
                  filter: currentSlide === index ? `drop-shadow(0 20px 30px ${slide.shadow})` : "none"
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  style={{ objectFit: "contain" }}
                  priority={index === 0}
                  unoptimized={true}
                />
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div style={styles.indicators}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  ...styles.dot,
                  background: currentSlide === index ? activeSlide.color : "rgba(0,0,0,0.1)",
                  width: currentSlide === index ? "35px" : "10px",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- CSS ANIMATIONS --- */}
      <style jsx>{`
        /* Staggered Text Animations */
        .slide-up-1 { opacity: 0; animation: slideUp 0.6s ease-out 0.1s forwards; }
        .slide-up-2 { opacity: 0; animation: slideUp 0.6s ease-out 0.2s forwards; }
        .slide-up-3 { opacity: 0; animation: slideUp 0.6s ease-out 0.3s forwards; }
        .slide-up-4 { opacity: 0; animation: slideUp 0.6s ease-out 0.4s forwards; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Continuous Float for Product */
        .floating-image {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0px); }
        }

        /* Pulsing Background Blobs */
        .blob-pulse {
          animation: pulse 8s infinite alternate;
        }
        .delay { animation-delay: 4s; }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 0.8; }
        }

        /* Button Shine Effect */
        .cta-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px -5px rgba(0,0,0,0.2);
        }
        .cta-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: 0.5s;
        }
        .cta-button:hover::after {
          left: 100%;
        }
      `}</style>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  homeBanner: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #ecfccb 100%)",
    height: "calc(100vh - 80px)", // Adjusted for typical nav height
    minHeight: "530px",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundBlobLeft: {
    position: "absolute",
    top: "-15%",
    left: "-5%",
    width: "50vw",
    height: "50vw",
    background: "radial-gradient(circle, rgba(187, 247, 208, 0.5) 0%, rgba(255,255,255,0) 70%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  backgroundBlobRight: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "45vw",
    height: "45vw",
    background: "radial-gradient(circle, rgba(254, 240, 138, 0.4) 0%, rgba(255,255,255,0) 70%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr", // Give text slightly more space
    gap: "4rem",
    alignItems: "center",
    width: "100%",
    padding: "0 2rem",
    position: "relative",
    zIndex: 2,
  },
  contentLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  textWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    alignItems: "flex-start",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "50px",
    fontSize: "0.85rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    background: "rgba(255,255,255,0.7)", // Glass effect
    backdropFilter: "blur(10px)",
    border: "1px solid",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  mainHeading: {
    fontSize: "clamp(3rem, 5vw, 4.5rem)", // Responsive font size
    fontWeight: 800,
    color: "#1e293b",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  description: {
    fontSize: "1.15rem",
    color: "#64748b",
    lineHeight: "1.7",
    maxWidth: "500px",
    margin: "10px 0 20px 0",
    fontWeight: 500,
  },
  ctaButton: {
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "50px",
    fontWeight: 700,
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 10px 20px -10px rgba(0,0,0,0.5)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "inline-block",
  },
  imageRight: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    height: "600px", 
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    perspective: "1000px", // Adds 3D space
  },
  imageGlow: {
    position: "absolute",
    width: "140%",
    height: "140%",
    top: "-20%",
    left: "-20%",
    borderRadius: "50%",
    transition: "background 1s ease",
    zIndex: 0,
    filter: "blur(60px)", // Softer glow
  },
  imageSlide: {
    position: "absolute",
    width: "100%",
    maxWidth: "600px", 
    height: "600px",
    transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy transition
  },
  indicators: {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "10px",
    zIndex: 10,
    background: "rgba(255,255,255,0.4)",
    padding: "8px 12px",
    borderRadius: "20px",
    backdropFilter: "blur(4px)",
  },
  dot: {
    height: "6px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  }
};