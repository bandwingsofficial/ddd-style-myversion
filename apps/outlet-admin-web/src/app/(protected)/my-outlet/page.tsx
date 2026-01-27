"use client";

import { useEffect, useState } from "react";
import { outletService } from "@/features/outlet/services/outletService";
import { Outlet } from "@/features/outlet/types";
import OutletControlCard from "@/features/outlet/components/OutletControlCard";

export default function MyOutletPage() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const outletData = await outletService.getOutlet();
      setOutlet(outletData);
    } catch (error) {
      console.error("Failed to load outlet data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading outlet details...</div>;
  if (!outlet) return <div style={styles.error}>Failed to load outlet info.</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Outlet Controls</h1>
        <p style={styles.pageSubtitle}>Manage your live store status and AI camera feed.</p>
      </div>

      <OutletControlCard outlet={outlet} refreshData={fetchData} />
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
  },
  error: {
    padding: '40px',
    textAlign: 'center',
    color: '#dc2626',
  }
};