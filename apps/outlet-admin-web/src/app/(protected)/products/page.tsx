"use client";

import { useEffect, useState } from "react";
import { outletService } from "@/features/outlet/services/outletService";
import { OutletProduct } from "@/features/outlet/types";
import ProductList from "@/features/outlet/components/ProductList";

export default function ProductsPage() {
  const [products, setProducts] = useState<OutletProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const productsData = await outletService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading products...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Product Management</h1>
        <p style={styles.pageSubtitle}>Enable or disable items for your outlet menu.</p>
      </div>

      <ProductList initialProducts={products} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    padding: '4px',
    maxWidth: '1024px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  pageHeader: {
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  }
};