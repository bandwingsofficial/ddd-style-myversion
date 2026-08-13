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
    return (
      <div style={styles.loading}>
        Loading outlet details…
      </div>
    );
  }

  if (!outlet) {
    return (
      <div style={styles.error}>
        Failed to load outlet information.
      </div>
    );
  }

  return (
    <>
      <div
        className="my-outlet-page"
        style={styles.pageContainer}
      >
        {/* Header */}
        <div
          className="my-outlet-header"
          style={styles.pageHeader}
        >
          <div className="my-outlet-heading">
            <h1 style={styles.pageTitle}>
              Outlet Controls
            </h1>

            <p style={styles.pageSubtitle}>
              Manage your live store status and AI camera feed
            </p>
          </div>

          <button
            onClick={() => fetchData(true)}
            style={styles.refreshBtn}
            disabled={refreshing}
            className="my-outlet-refresh"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Status Overview */}
        <div
          className="my-outlet-status-grid"
          style={styles.statusGrid}
        >
          <StatusCard
            label="Outlet Status"
            value={outlet.status}
            color={
              outlet.status === "ACTIVE"
                ? "#16a34a"
                : "#dc2626"
            }
          />

          <StatusCard
            label="Working State"
            value={outlet.workingState.status}
            color={
              outlet.workingState.status === "OPEN"
                ? "#16a34a"
                : "#f59e0b"
            }
          />

          <StatusCard
            label="Camera"
            value={outlet.cameraState.status}
            color={
              outlet.cameraState.enabled
                ? "#16a34a"
                : "#6b7280"
            }
          />
        </div>

        {/* Controls */}
        <div className="my-outlet-controls">
          <OutletControlCard
            outlet={outlet}
            refreshData={() => fetchData(true)}
          />
        </div>
      </div>

      <style jsx>{`
        .my-outlet-page {
          width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .my-outlet-header {
          width: 100%;
          box-sizing: border-box;
        }

        .my-outlet-heading {
          min-width: 0;
        }

        .my-outlet-controls {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .my-outlet-refresh {
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .my-outlet-page {
            padding: 14px !important;
          }

          .my-outlet-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 20px !important;
          }

          .my-outlet-heading {
            width: 100%;
          }

          .my-outlet-refresh {
            width: 100%;
            min-height: 42px;
          }

          /*
           * MOBILE:
           * Keep all 3 status cards in ONE ROW.
           */
          .my-outlet-status-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            ) !important;

            gap: 8px !important;
            margin-bottom: 20px !important;
            width: 100%;
          }

          .my-outlet-status-card {
            min-width: 0 !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }

          .my-outlet-status-card .status-label {
            font-size: 10px !important;
          }

          .my-outlet-controls {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .my-outlet-page {
            padding: 12px !important;
          }

          .my-outlet-header {
            gap: 12px !important;
          }

          .my-outlet-status-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            ) !important;

            gap: 6px !important;
          }

          .my-outlet-status-card {
            padding: 9px 7px !important;
          }
        }

        @media (max-width: 360px) {
          .my-outlet-page {
            padding: 10px !important;
          }

          .my-outlet-status-grid {
            gap: 5px !important;
          }

          .my-outlet-status-card {
            padding: 8px 5px !important;
          }
        }
      `}</style>
    </>
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
    <div
      style={styles.statusCard}
      className="my-outlet-status-card"
    >
      <span
        style={styles.statusLabel}
        className="status-label"
      >
        {label}
      </span>

      <span
        style={{
          ...styles.statusValue,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const styles: {
  [key: string]: React.CSSProperties;
} = {
  pageContainer: {
    padding: "16px",
    maxWidth: "1024px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    boxSizing: "border-box",
    width: "100%",
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
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },

  statusCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    boxShadow:
      "0 1px 2px rgba(0,0,0,0.05)",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },

  statusLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  statusValue: {
    fontSize: "18px",
    fontWeight: "700",
    textTransform: "capitalize",
    overflowWrap: "anywhere",
    whiteSpace: "nowrap",
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