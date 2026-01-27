"use client";

import { useEffect, useState } from "react";
import { outletService } from "@/features/outlet/services/outletService";
import { Outlet, OutletProduct } from "@/features/outlet/types";
import OutletControlCard from "@/features/outlet/components/OutletControlCard";
import ProductList from "@/features/outlet/components/ProductList";

export default function MyOutletPage() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [products, setProducts] = useState<OutletProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [outletData, productsData] = await Promise.all([
        outletService.getOutlet(),
        outletService.getProducts()
      ]);
      setOutlet(outletData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load outlet data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading outlet details...</div>;
  }

  if (!outlet) {
    return <div style={styles.error}>Failed to load outlet info.</div>;
  }

  return (
    <div style={styles.pageContainer}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Outlet Management</h1>
        <p style={styles.pageSubtitle}>Manage your branch status, camera, and product availability.</p>
      </div>

      {/* Components */}
      <OutletControlCard outlet={outlet} refreshData={fetchData} />
      <ProductList initialProducts={products} />
      
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1024px',
    margin: '0 auto',
    fontFamily: 'sans-serif', // Ensures font matches your sidebar
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
    fontSize: '16px',
  },
  error: {
    padding: '40px',
    textAlign: 'center',
    color: '#dc2626',
    fontSize: '16px',
  }
};