"use client";

import { useState } from "react";
import { Outlet } from "../types";
import { outletService } from "../services/outletService";

interface Props {
  outlet: Outlet;
  refreshData: () => void;
}

export default function OutletControlCard({ outlet, refreshData }: Props) {
  const [loading, setLoading] = useState(false);

  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = outlet.workingState.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await outletService.updateWorkingStatus(newStatus);
      refreshData();
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraToggle = async () => {
    setLoading(true);
    const action = outlet.cameraState.status === "ON" ? "off" : "on";
    try {
      await outletService.toggleCamera(action, "http://stream.com");
      refreshData();
    } catch (error) {
      console.error("Camera toggle failed", error);
    } finally {
      setLoading(false);
    }
  };

  const isStoreOpen = outlet.workingState.status === "OPEN";
  const isCameraOn = outlet.cameraState.status === "ON";

  return (
    <div style={styles.card}>
      {/* Card Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{outlet.name}</h2>
          <div style={styles.subInfo}>
            <span>{outlet.branch}</span>
            <span style={styles.dot}>•</span>
            <span>Radius: {outlet.deliveryRadiusKm}km</span>
          </div>
        </div>
        
        <span style={{
          ...styles.badge,
          backgroundColor: outlet.status === "ACTIVE" ? '#dcfce7' : '#fee2e2',
          color: outlet.status === "ACTIVE" ? '#166534' : '#991b1b',
        }}>
          {outlet.status}
        </span>
      </div>

      {/* Action Cards Container */}
      <div style={styles.grid}>
        
        {/* Store Status Block */}
        <div style={styles.actionBlock}>
          <div style={styles.blockHeader}>
            <span style={styles.label}>Store Status</span>
            <div style={{
              ...styles.statusDot,
              backgroundColor: isStoreOpen ? '#22c55e' : '#ef4444'
            }} />
          </div>
          
          <div style={styles.blockFooter}>
            <span style={{...styles.value, color: isStoreOpen ? '#111827' : '#9ca3af'}}>
              {outlet.workingState.status}
            </span>
            <button
              onClick={handleStatusToggle}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: isStoreOpen ? '#dc2626' : '#16a34a',
                color: 'white',
              }}
            >
              {loading ? "Updating..." : (isStoreOpen ? "Close Store" : "Open Store")}
            </button>
          </div>
        </div>

        {/* AI Camera Block */}
        <div style={styles.actionBlock}>
          <div style={styles.blockHeader}>
            <span style={styles.label}>AI Camera</span>
            <div style={{
              ...styles.statusDot,
              backgroundColor: isCameraOn ? '#3b82f6' : '#9ca3af'
            }} />
          </div>

          <div style={styles.blockFooter}>
            <span style={{...styles.value, color: isCameraOn ? '#111827' : '#9ca3af'}}>
              {outlet.cameraState.status}
            </span>
            <button
              onClick={handleCameraToggle}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: 'white',
                border: isCameraOn ? '1px solid #fca5a5' : '1px solid #bfdbfe',
                color: isCameraOn ? '#dc2626' : '#2563eb',
              }}
            >
              {loading ? "Processing..." : (isCameraOn ? "Turn Off" : "Turn On")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    marginBottom: '4px',
  },
  subInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280',
  },
  dot: {
    color: '#d1d5db',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  grid: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  actionBlock: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '140px',
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  blockFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: '24px',
    fontWeight: '700',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
};