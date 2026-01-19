"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const categories = [
  { 
    id: "cane", 
    name: "Sugarcane Juice", 
    description: "Freshly pressed natural energy from organic farms.",
    image: "/images/cate-1.jpg", 
  },
  { 
    id: "coconut", 
    name: "Tender Coconut", 
    description: "Creamy hydration sourced directly from nature.",
    image: "/images/cate-2.jpg", 
  },
  { 
    id: "combos", 
    name: "Value Combos", 
    description: "Perfect pairings of juice and coconut for sharing.",
    image: "/images/banner.jpg", 
  },
];

// --- Animation Variants ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 }, 
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 50,
      damping: 15
    }
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

export default function Categories() {
  return (
    <section style={styles.categoriesSection}>
      <div style={styles.sectionContainer}>
        
        {/* Animated Header */}
        <motion.div 
          style={styles.centeredHeader}
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
            Explore Our Menu
          </motion.h2>

          {/* Animated Subtitle */}
          <motion.p 
            style={styles.subtitle}
            variants={subtitleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Sourced directly from organic farms for peak flavor.
          </motion.p>
        </motion.div>

        {/* Animated Grid */}
        <motion.div 
          style={styles.categoriesGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="categories-grid"
        >
          {categories.map((cat) => (
            <motion.div 
              key={cat.id} 
              variants={itemVariants} 
              style={styles.categoryCard} 
              className="category-card"
            >
              {/* Image Container */}
              <div style={styles.imageWrapper}>
                <Image 
                  src={cat.image} 
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                  style={{ objectFit: "cover" }}
                  priority={false}
                />
              </div>

              {/* Content Container */}
              <div style={styles.contentWrapper}>
                <h3 style={styles.categoryName}>{cat.name}</h3>
                <p style={styles.categoryDesc}>{cat.description}</p>
                <Link href={`/menu?category=${cat.id}`} style={styles.orderLink} className="order-link">
                  View Products →
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .category-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
          border-color: #d1fae5 !important;
        }
        .order-link {
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .category-card:hover .order-link {
          color: #15803d !important; 
          gap: 8px; 
        }
      `}</style>
      
      <style jsx global>{`
        @media (max-width: 1024px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .categories-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// Styles Object
const styles: { [key: string]: React.CSSProperties } = {
  categoriesSection: {
    padding: "30px 0",
    backgroundColor: "#ffffff",
    overflow: "hidden"
  },
  sectionContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  centeredHeader: {
    textAlign: "center",
    marginBottom: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    marginBottom: "0", // Handled by subtitle margin
    letterSpacing: "-0.02em",
    // SHINE EFFECT
    backgroundImage: "linear-gradient(to right, #064e3b 20%, #4ade80 40%, #4ade80 60%, #064e3b 80%)",
    backgroundSize: "200% auto",
    color: "transparent",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem",
    maxWidth: "600px",
    marginTop: "12px",
    marginBottom: "0",
    lineHeight: "1.6",
  },
  titleUnderline: {
    width: "60px",
    height: "4px",
    background: "#22c55e",
    borderRadius: "2px",
    marginTop: "20px",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", 
    gap: "24px",
  },
  categoryCard: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    cursor: "pointer",
    height: "100%",
    // Note: Box-shadow handles in CSS class for hover efficiency
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: "220px", 
    backgroundColor: "#f3f4f6",
  },
  contentWrapper: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    alignItems: "center",
    textAlign: "center",
  },
  categoryName: {
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "8px",
  },
  categoryDesc: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  orderLink: {
    marginTop: "auto",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#94a3b8",
    textDecoration: "none",
  }
};