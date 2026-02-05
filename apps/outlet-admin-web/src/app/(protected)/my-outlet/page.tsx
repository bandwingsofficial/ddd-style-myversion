"use client";

import { useEffect, useState } from "react";
import { outletService } from "@/features/outlet/services/outletService";
import { Outlet } from "@/features/outlet/types";
import OutletControlCard from "@/features/outlet/components/OutletControlCard";

export default function MyOutletPage() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const outletData = await outletService.getOutlet();
      setOutlet(outletData);
    } catch (error) {
      console.error("Failed to load outlet data", error);
      setOutlet(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading outlet details…</div>;
  }

  if (!outlet) {
    return <div style={styles.error}>Failed to load outlet information.</div>;
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Outlet Controls</h1>
          <p style={styles.pageSubtitle}>
            Manage your live store status and AI camera feed
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          style={styles.refreshBtn}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Status Overview */}
      <div style={styles.statusGrid}>
        <StatusCard
          label="Outlet Status"
          value={outlet.status}
          color={outlet.status === "ACTIVE" ? "#16a34a" : "#dc2626"}
        />

        <StatusCard
          label="Working State"
          value={outlet.workingState.status}
          color={outlet.workingState.status === "OPEN" ? "#16a34a" : "#f59e0b"}
        />

        <StatusCard
          label="Camera"
          value={outlet.cameraState.status}
          color={outlet.cameraState.enabled ? "#16a34a" : "#6b7280"}
        />
      </div>

      {/* Controls */}
      <OutletControlCard outlet={outlet} refreshData={() => fetchData(true)} />
    </div>
  );
}

/* ---------------- Small Reusable Component ---------------- */

function StatusCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={styles.statusCard}>
      <span style={styles.statusLabel}>{label}</span>
      <span style={{ ...styles.statusValue, color }}>{value}</span>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    padding: "16px",
    maxWidth: "1024px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
  },

  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },

  pageSubtitle: {
    fontSize: "15px",
    color: "#6b7280",
  },

  refreshBtn: {
    padding: "8px 14px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },

  statusCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },

  statusLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "6px",
  },

  statusValue: {
    fontSize: "18px",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  loading: {
    padding: "60px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
  },

  error: {
    padding: "60px",
    textAlign: "center",
    color: "#dc2626",
    fontSize: "16px",
  },
};
