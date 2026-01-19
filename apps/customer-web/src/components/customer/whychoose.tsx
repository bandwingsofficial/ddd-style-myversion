"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

// --- Data Configuration ---
const features = [
  { 
    id: 1, 
    title: "Farm Fresh", 
    description: "Sourced directly from organic farms for peak flavor.", 
    image: "/images/farm-fresh.png", 
    color: "#22c55e" 
  },
  { 
    id: 2, 
    title: "Hygiene First", 
    description: "Prepared following stringent hygiene protocols.", 
    image: "/images/hygeine-first.png", 
    color: "#0ea5e9" 
  },
  { 
    id: 3, 
    title: "Live Preparation", 
    description: "Juices are pressed live and on-demand.", 
    image: "/images/Live-Prep.png", 
    color: "#f59e0b" 
  },
  { 
    id: 4, 
    title: "Fast Delivery", 
    description: "Quick and efficient delivery to your doorstep.", 
    image: "/images/Fast-Delivery.png", 
    color: "#ef4444" 
  },
];

// --- Animations ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
  }
};

export default function WhyChooseUs() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        
        {/* Header */}
        <motion.div 
          style={styles.header}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Shining Title */}
          <motion.h2 
            style={styles.title}
            animate={{ 
              backgroundPosition: ["0% center", "200% center"] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            Why Choose Us?
          </motion.h2>

          {/* Animated Subtitle */}
          <motion.p 
            style={styles.subtitle}
            variants={subtitleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Experience the perfect blend of taste, health, and absolute convenience.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          style={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="why-grid" // Added class for media queries
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id} 
              variants={itemVariants}
              style={styles.card}
              whileHover={{ y: -8, borderColor: feature.color, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="feature-card"
            >
              {/* Image Container */}
              <div style={styles.imageContainer}>
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  style={styles.image}
                />
              </div>

              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .why-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .why-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  section: {
    padding: "30px 0",
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
    // SHINE EFFECT STYLES
    backgroundImage: "linear-gradient(to right, #0f172a 20%, #22c55e 40%, #22c55e 60%, #0f172a 80%)",
    backgroundSize: "200% auto",
    color: "transparent",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    marginTop: "12px",
    marginBottom: "0",
    maxWidth: "600px",
    lineHeight: "1.6",
  },
  titleUnderline: {
    width: "60px",
    height: "4px",
    background: "#22c55e",
    borderRadius: "2px",
    marginTop: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "32px 24px",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "default",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    transition: "box-shadow 0.3s ease",
  },
  imageContainer: {
    width: "72px",
    height: "72px",
    marginBottom: "20px",
    borderRadius: "16px",
    overflow: "hidden", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "12px",
  },
  featureDescription: {
    fontSize: "0.95rem",
    color: "#64748b",
    lineHeight: "1.6",
    margin: 0,
    fontWeight: 400,
  },
};