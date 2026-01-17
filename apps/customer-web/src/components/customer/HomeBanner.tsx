  "use client";

  import React, { useState, useEffect } from "react";
  import Link from "next/link";
  import Image from "next/image";

  export default function HomeBanner() {
    const bannerImages = [
      "/images/banner2.jpg",
      "/images/splash3.jpg", 
      "/images/banner_cane.jpg"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      const animTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 100); 

      return () => clearTimeout(animTimer);
    }, []);

    useEffect(() => {
      if (!isLoaded) return;
      const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(timer);
    }, [bannerImages.length, isLoaded]);

    return (
      <section style={styles.homeBanner}>
        <div style={styles.backgroundBlob} />

        <div style={styles.container}>
          {/* Left Text Content */}
          <div 
            style={{
              ...styles.contentLeft,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(40px)",
              transition: "opacity 1s ease-out, transform 1s ease-out"
            }}
          >
            {/* UPDATED BADGE */}
            <div style={styles.badge}>
              <Image 
                src="/images/4.png"  // Make sure this file exists in your public/images folder
                alt="Natural Icon" 
                width={20} 
                height={20} 
                style={{ objectFit: "contain", display: "block" }} 
                unoptimized={true} // Fixes potential broken image issues in dev
              />
              <span style={{ position: "relative", top: "1px" }}>100% Natural</span>
            </div>

            <h1 style={styles.mainHeading}>
              Fresh, Hygienic, Live <br />
              <span style={{ color: "#16a34a" }}>Preparation.</span> <br />
              Experience Purity.
            </h1>
            <p style={styles.description}>
              Savour the authentic taste of nature with our advanced cane and tender coconut platform, delivered fresh to your doorstep.
            </p>
            
            <Link href="/menu" style={{ textDecoration: 'none' }}>
              <button style={styles.ctaButton} className="cta-hover">
                Order Fresh Now
              </button>
            </Link>
          </div>

          {/* Right Image Content */}
          <div style={styles.imageRight}>
            <div 
              style={{
                ...styles.mainImageWrapper,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "scale(1)" : "scale(0.9)",
                transition: "opacity 1.2s ease-out 0.3s, transform 1.2s ease-out 0.3s",
              }}
            >
              {bannerImages.map((src, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.imageSlide,
                    opacity: currentImageIndex === index ? 1 : 0,
                  }}
                >
                  <Image
                    src={src}
                    alt={`Fresh Juice Banner ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={index === 0} 
                    unoptimized={true}
                  />
                </div>
              ))}
              
              <div style={styles.indicators}>
                {bannerImages.map((_, index) => (
                  <div 
                    key={index}
                    style={{
                      ...styles.dot,
                      background: currentImageIndex === index ? "#ffffff" : "rgba(255,255,255,0.5)",
                      transform: currentImageIndex === index ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .cta-hover:hover {
            background-color: #15803d !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px -5px rgba(22, 163, 74, 0.4);
          }
        `}</style>
      </section>
    );
  }

  const styles: { [key: string]: React.CSSProperties } = {
    homeBanner: {
      background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #dcfce7 100%)",
      height: "calc(100vh - 72px)",
      display: "flex",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      marginTop: "100px",
    },
    backgroundBlob: {
      position: "absolute",
      top: "-10%",
      right: "-5%",
      width: "600px",
      height: "600px",
      background: "radial-gradient(circle, rgba(187, 247, 208, 0.4) 0%, rgba(255,255,255,0) 70%)",
      zIndex: 1,
      pointerEvents: "none",
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
      position: "relative",
      zIndex: 2,
    },
    contentLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      paddingRight: "40px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px", // Increased gap slightly for cleaner look
      padding: "8px 16px 8px 12px", // Balanced padding
      background: "#dcfce7",
      color: "#166534",
      borderRadius: "30px",
      fontSize: "0.85rem",
      fontWeight: "700",
      width: "fit-content",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)", // Subtle depth
    },
    mainHeading: {
      fontSize: "3.5rem",
      fontWeight: 800,
      color: "#1e293b",
      lineHeight: "1.1",
      letterSpacing: "-0.03em",
      margin: 0,
    },
    description: {
      fontSize: "1.15rem",
      color: "#64748b",
      lineHeight: "1.7",
      maxWidth: "520px",
      margin: 0,
    },
    ctaButton: {
      background: "#16a34a",
      color: "white",
      border: "none",
      padding: "18px 36px",
      borderRadius: "50px",
      fontWeight: 700,
      fontSize: "1.1rem",
      cursor: "pointer",
      width: "fit-content",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    imageRight: {
      display: "flex",
      justifyContent: "center",
      position: "relative",
    },
    mainImageWrapper: {
      width: "100%",
      maxWidth: "380px",
      aspectRatio: "1 / 1",
      overflow: "hidden",
      position: "relative",
      background: "#fff",
      borderRadius: "50%",
      boxShadow: "0 25px 50px -12px rgba(22, 163, 74, 0.25)",
      border: "8px solid rgba(255, 255, 255, 0.6)",
    },
    imageSlide: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      transition: "opacity 0.8s ease-in-out",
    },
    indicators: {
      position: "absolute",
      bottom: "25px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "8px",
      zIndex: 10,
    },
    dot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      transition: "all 0.3s ease",
      border: "1px solid rgba(0,0,0,0.1)",
    }
  };