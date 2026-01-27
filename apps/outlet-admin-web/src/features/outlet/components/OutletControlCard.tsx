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

  // Helper booleans for cleaner logic
  const isStoreOpen = outlet.workingState.status === "OPEN";
  const isCameraOn = outlet.cameraState.status === "ON";

  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = isStoreOpen ? "CLOSED" : "OPEN";

    try {
      // 1. If we are CLOSING the store, and Camera is ON -> Turn Camera OFF first
      if (newStatus === "CLOSED" && isCameraOn) {
        await outletService.toggleCamera("off");
      }

      // 2. Update the Store Status
      await outletService.updateWorkingStatus(newStatus);
      
      // 3. Refresh data to show new states
      refreshData();
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraToggle = async () => {
    // Prevent clicking if store is closed
    if (!isStoreOpen) return;

    setLoading(true);
    const action = isCameraOn ? "off" : "on";
    try {
      await outletService.toggleCamera(action, "http://stream.com");
      refreshData();
    } catch (error) {
      console.error("Camera toggle failed", error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Action Cards Grid */}
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
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Processing..." : (isStoreOpen ? "Close Store" : "Open Store")}
            </button>
          </div>
        </div>

        {/* AI Camera Block */}
        <div style={{
          ...styles.actionBlock,
          // Optional: visually gray out the whole block if locked
          backgroundColor: isStoreOpen ? '#f9fafb' : '#f3f4f6', 
        }}>
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
            
            {/* Camera Button Logic */}
            <button
              onClick={handleCameraToggle}
              // DISABLED if loading OR Store is Closed
              disabled={loading || !isStoreOpen} 
              style={{
                ...styles.button,
                // If Store Closed: Gray/Disabled Style
                // If Store Open: Normal Blue/Red Style
                backgroundColor: !isStoreOpen ? '#e5e7eb' : 'white',
                border: !isStoreOpen 
                  ? '1px solid #d1d5db' 
                  : (isCameraOn ? '1px solid #fca5a5' : '1px solid #bfdbfe'),
                color: !isStoreOpen 
                  ? '#9ca3af' 
                  : (isCameraOn ? '#dc2626' : '#2563eb'),
                cursor: !isStoreOpen ? 'not-allowed' : 'pointer',
              }}
            >
              {!isStoreOpen 
                ? "Locked (Store Closed)" 
                : (loading ? "..." : (isCameraOn ? "Turn Off" : "Turn On"))
              }
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
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '140px',
    transition: 'background-color 0.2s',
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