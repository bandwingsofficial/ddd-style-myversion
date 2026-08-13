"use client";

import { useState } from "react";
import { Outlet } from "../types";
import { outletService } from "../services/outletService";
import {
  Store,
  Camera,
  MapPin,
  Activity,
  Power,
  Lock,
  CircleDot,
  AlertCircle,
} from "lucide-react";

interface Props {
  outlet: Outlet;
  refreshData: () => void;
}

export default function OutletControlCard({
  outlet,
  refreshData,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ---------------- Helper booleans ---------------- */

  const isOutletActive =
    outlet.status === "ACTIVE";

  const isStoreOpen =
    outlet.workingState.status === "OPEN";

  const isCameraOn =
    outlet.cameraState.status === "ON";

  /* ---------------- Store Status Toggle ---------------- */

  const handleStatusToggle = async () => {
    // PREVENT API CALL IF OUTLET IS INACTIVE
    if (!isOutletActive) return;

    setLoading(true);

    const newStatus = isStoreOpen
      ? "CLOSED"
      : "OPEN";

    try {
      if (
        newStatus === "CLOSED" &&
        isCameraOn
      ) {
        await outletService.toggleCamera("off");
      }

      await outletService.updateWorkingStatus(
        newStatus,
      );

      refreshData();
    } catch (error) {
      console.error(
        "Failed to update status",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Camera Toggle ---------------- */

  const handleCameraToggle = async () => {
    if (!isStoreOpen) return;

    setLoading(true);

    const action = isCameraOn
      ? "off"
      : "on";

    try {
      await outletService.toggleCamera(
        action,
        "http://stream.com",
      );

      refreshData();
    } catch (error) {
      console.error(
        "Camera toggle failed",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={styles.card}
        className="outlet-control-card"
      >
        {/* Card Header */}
        <div
          style={styles.header}
          className="outlet-control-header"
        >
          <div
            style={styles.headerContent}
            className="outlet-control-header-content"
          >
            <div
              style={styles.iconBox}
              className="outlet-control-icon-box"
            >
              <Store
                size={24}
                color="#0f172a"
              />
            </div>

            <div className="outlet-control-heading">
              <h2 style={styles.title}>
                {outlet.name}
              </h2>

              <div
                style={styles.subInfo}
                className="outlet-control-subinfo"
              >
                <div style={styles.infoItem}>
                  <MapPin size={12} />

                  <span>
                    {outlet.branch}
                  </span>
                </div>

                <span style={styles.dot}>
                  •
                </span>

                <div style={styles.infoItem}>
                  <CircleDot size={12} />

                  <span>
                    {outlet.deliveryRadiusKm}
                    km Radius
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span
            style={{
              ...styles.badge,
              backgroundColor:
                isOutletActive
                  ? "#dcfce7"
                  : "#fee2e2",
              color: isOutletActive
                ? "#15803d"
                : "#991b1b",
              border: isOutletActive
                ? "1px solid #bbf7d0"
                : "1px solid #fecaca",
            }}
            className="outlet-control-badge"
          >
            <Activity size={12} />

            {outlet.status}
          </span>
        </div>

        {/* Action Cards Grid */}
        <div
          style={styles.grid}
          className="outlet-control-grid"
        >
          {/* --- Store Status Block --- */}
          <div
            style={{
              ...styles.actionBlock,

              // Grey out background if Outlet is INACTIVE
              backgroundColor: !isOutletActive
                ? "#f8fafc"
                : isStoreOpen
                  ? "#f0fdf4"
                  : "white",

              borderColor: !isOutletActive
                ? "#e2e8f0"
                : isStoreOpen
                  ? "#bbf7d0"
                  : "#e2e8f0",

              backgroundImage:
                !isOutletActive
                  ? "repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px)"
                  : "none",
            }}
            className="outlet-action-block"
          >
            <div
              style={styles.blockHeader}
            >
              <div
                style={styles.labelGroup}
              >
                {/* Change Icon to Lock if Inactive */}
                {!isOutletActive ? (
                  <Lock
                    size={16}
                    color="#94a3b8"
                  />
                ) : (
                  <Store
                    size={16}
                    color={
                      isStoreOpen
                        ? "#15803d"
                        : "#64748b"
                    }
                  />
                )}

                <span
                  style={{
                    ...styles.label,
                    color: !isOutletActive
                      ? "#94a3b8"
                      : isStoreOpen
                        ? "#15803d"
                        : "#64748b",
                  }}
                >
                  Store Status
                </span>
              </div>

              {/* Status Dot */}
              {isOutletActive && (
                <div
                  style={{
                    ...styles.statusDot,
                    backgroundColor:
                      isStoreOpen
                        ? "#22c55e"
                        : "#cbd5e1",
                    boxShadow:
                      isStoreOpen
                        ? "0 0 0 4px #dcfce7"
                        : "none",
                  }}
                />
              )}
            </div>

            <div
              style={styles.blockBody}
            >
              <span
                style={{
                  ...styles.value,
                  color: !isOutletActive
                    ? "#94a3b8"
                    : isStoreOpen
                      ? "#166534"
                      : "#1e293b",
                }}
              >
                {/* Display specific text if inactive */}
                {!isOutletActive
                  ? "DISABLED"
                  : outlet.workingState
                      .status}
              </span>

              <p
                style={styles.helperText}
              >
                {!isOutletActive
                  ? "Contact Super Admin to activate"
                  : isStoreOpen
                    ? "Accepting new orders"
                    : "Currently not accepting orders"}
              </p>
            </div>

            <div
              style={styles.blockFooter}
            >
              <button
                onClick={
                  handleStatusToggle
                }
                disabled={
                  loading ||
                  !isOutletActive
                }
                style={{
                  ...styles.button,
                  width: "100%",

                  // Locked styling
                  backgroundColor:
                    !isOutletActive
                      ? "#e2e8f0"
                      : isStoreOpen
                        ? "white"
                        : "#16a34a",

                  border:
                    !isOutletActive
                      ? "1px solid #cbd5e1"
                      : isStoreOpen
                        ? "1px solid #fee2e2"
                        : "1px solid #16a34a",

                  color: !isOutletActive
                    ? "#94a3b8"
                    : isStoreOpen
                      ? "#ef4444"
                      : "white",

                  opacity: loading
                    ? 0.7
                    : 1,

                  cursor:
                    !isOutletActive
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {!isOutletActive ? (
                  <Lock size={14} />
                ) : (
                  <Power size={16} />
                )}

                {loading
                  ? "Processing..."
                  : !isOutletActive
                    ? "Locked by Admin"
                    : isStoreOpen
                      ? "Close Store"
                      : "Open Store"}
              </button>
            </div>
          </div>

          {/* --- AI Camera Block --- */}
          <div
            style={{
              ...styles.actionBlock,

              backgroundColor: !isStoreOpen
                ? "#f8fafc"
                : isCameraOn
                  ? "#eff6ff"
                  : "white",

              borderColor: !isStoreOpen
                ? "#e2e8f0"
                : isCameraOn
                  ? "#bfdbfe"
                  : "#e2e8f0",

              backgroundImage:
                !isStoreOpen
                  ? "repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px)"
                  : "none",
            }}
            className="outlet-action-block"
          >
            <div
              style={styles.blockHeader}
            >
              <div
                style={styles.labelGroup}
              >
                <Camera
                  size={16}
                  color={
                    !isStoreOpen
                      ? "#94a3b8"
                      : isCameraOn
                        ? "#1d4ed8"
                        : "#64748b"
                  }
                />

                <span
                  style={{
                    ...styles.label,
                    color: !isStoreOpen
                      ? "#94a3b8"
                      : isCameraOn
                        ? "#1d4ed8"
                        : "#64748b",
                  }}
                >
                  AI Camera
                </span>
              </div>

              {!isStoreOpen ? (
                <Lock
                  size={16}
                  color="#94a3b8"
                />
              ) : (
                <div
                  style={{
                    ...styles.statusDot,
                    backgroundColor:
                      isCameraOn
                        ? "#3b82f6"
                        : "#cbd5e1",
                    boxShadow:
                      isCameraOn
                        ? "0 0 0 4px #dbeafe"
                        : "none",
                  }}
                />
              )}
            </div>

            <div
              style={styles.blockBody}
            >
              <span
                style={{
                  ...styles.value,
                  color: !isStoreOpen
                    ? "#94a3b8"
                    : isCameraOn
                      ? "#1e40af"
                      : "#1e293b",
                }}
              >
                {outlet.cameraState.status}
              </span>

              <p
                style={styles.helperText}
              >
                {!isStoreOpen
                  ? "Store must be open to use camera"
                  : "Analytics and monitoring"}
              </p>
            </div>

            <div
              style={styles.blockFooter}
            >
              <button
                onClick={
                  handleCameraToggle
                }
                disabled={
                  loading ||
                  !isStoreOpen
                }
                style={{
                  ...styles.button,
                  width: "100%",

                  backgroundColor:
                    !isStoreOpen
                      ? "#e2e8f0"
                      : isCameraOn
                        ? "white"
                        : "#2563eb",

                  border: !isStoreOpen
                    ? "1px solid #cbd5e1"
                    : isCameraOn
                      ? "1px solid #bfdbfe"
                      : "1px solid #2563eb",

                  color: !isStoreOpen
                    ? "#94a3b8"
                    : isCameraOn
                      ? "#2563eb"
                      : "white",

                  cursor:
                    !isStoreOpen
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {!isStoreOpen ? (
                  <Lock size={14} />
                ) : (
                  <Power size={14} />
                )}

                <span>
                  {!isStoreOpen
                    ? "Locked"
                    : loading
                      ? "..."
                      : isCameraOn
                        ? "Turn Off"
                        : "Turn On"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .outlet-control-card {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .outlet-control-header {
          width: 100%;
          box-sizing: border-box;
        }

        .outlet-control-header-content {
          min-width: 0;
          flex: 1;
        }

        .outlet-control-heading {
          min-width: 0;
        }

        .outlet-control-subinfo {
          min-width: 0;
          flex-wrap: wrap;
        }

        .outlet-control-badge {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .outlet-control-grid {
          width: 100%;
          box-sizing: border-box;
        }

        .outlet-action-block {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          .outlet-control-header {
            padding: 16px !important;
            gap: 14px !important;
            align-items: flex-start !important;
          }

          .outlet-control-header-content {
            width: 100%;
            gap: 10px !important;
          }

          .outlet-control-icon-box {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            border-radius: 10px !important;
          }

          .outlet-control-icon-box svg {
            width: 20px;
            height: 20px;
          }

          .outlet-control-heading {
            flex: 1;
          }

          .outlet-control-subinfo {
            gap: 6px !important;
            font-size: 11px !important;
            line-height: 1.4;
          }

          .outlet-control-subinfo .outlet-control-info-item {
            min-width: 0;
          }

          .outlet-control-badge {
            padding: 5px 9px !important;
            font-size: 10px !important;
          }

          .outlet-control-grid {
            padding: 16px !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .outlet-action-block {
            height: auto !important;
            min-height: 180px;
            padding: 16px !important;
          }

          .outlet-action-block .outlet-action-button {
            min-height: 40px;
          }
        }

        @media (max-width: 480px) {
          .outlet-control-header {
            padding: 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .outlet-control-header-content {
            width: 100%;
          }

          .outlet-control-badge {
            align-self: flex-start;
          }

          .outlet-control-grid {
            padding: 12px !important;
          }

          .outlet-action-block {
            padding: 14px !important;
            min-height: 175px;
          }
        }

        @media (max-width: 360px) {
          .outlet-control-header {
            padding: 12px !important;
          }

          .outlet-control-grid {
            padding: 10px !important;
          }

          .outlet-action-block {
            padding: 12px !important;
          }

          .outlet-control-subinfo {
            font-size: 10px !important;
          }

          .outlet-control-badge {
            font-size: 9px !important;
            padding: 4px 7px !important;
          }
        }
      `}</style>
    </>
  );
}

/* ---------------- Styles ---------------- */

const styles: {
  [key: string]: React.CSSProperties;
} = {
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    border: "1px solid #f1f5f9",
    marginBottom: "24px",
    overflow: "hidden",
    fontFamily: '"Inter", sans-serif',
    width: "100%",
    boxSizing: "border-box",
  },

  header: {
    padding: "24px 32px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    gap: "16px",
    boxSizing: "border-box",
  },

  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minWidth: 0,
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
    flexShrink: 0,
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    marginBottom: "4px",
    letterSpacing: "-0.025em",
    overflowWrap: "anywhere",
  },

  subInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: 0,
  },

  dot: {
    color: "#cbd5e1",
    fontSize: "8px",
    flexShrink: 0,
  },

  badge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.025em",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  grid: {
    padding: "32px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    width: "100%",
  },

  actionBlock: {
    padding: "24px",
    borderRadius: "16px",
    borderWidth: "1px",
    borderStyle: "solid",
    display: "flex",
    flexDirection: "column",
    height: "180px",
    minWidth: 0,
    boxSizing: "border-box",
    transition:
      "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  blockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "10px",
  },

  labelGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
    flexShrink: 0,
  },

  blockBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 0,
  },

  value: {
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
    marginBottom: "4px",
    overflowWrap: "anywhere",
  },

  helperText: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },

  blockFooter: {
    marginTop: "16px",
    width: "100%",
  },

  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s active",
    boxShadow:
      "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
    minWidth: 0,
  },
};