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
  AlertCircle
} from "lucide-react";

interface Props {
  outlet: Outlet;
  refreshData: () => void;
}

export default function OutletControlCard({ outlet, refreshData }: Props) {
  const [loading, setLoading] = useState(false);

  // Helper booleans
  const isOutletActive = outlet.status === "ACTIVE"; // Check Super Admin status
  const isStoreOpen = outlet.workingState.status === "OPEN";
  const isCameraOn = outlet.cameraState.status === "ON";

  const handleStatusToggle = async () => {
    // PREVENT API CALL IF OUTLET IS INACTIVE
    if (!isOutletActive) return;

    setLoading(true);
    const newStatus = isStoreOpen ? "CLOSED" : "OPEN";

    try {
      if (newStatus === "CLOSED" && isCameraOn) {
        await outletService.toggleCamera("off");
      }
      await outletService.updateWorkingStatus(newStatus);
      refreshData();
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraToggle = async () => {
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
        <div style={styles.headerContent}>
          <div style={styles.iconBox}>
             <Store size={24} color="#0f172a" />
          </div>
          <div>
            <h2 style={styles.title}>{outlet.name}</h2>
            <div style={styles.subInfo}>
              <div style={styles.infoItem}>
                <MapPin size={12} />
                <span>{outlet.branch}</span>
              </div>
              <span style={styles.dot}>•</span>
              <div style={styles.infoItem}>
                <CircleDot size={12} />
                <span>{outlet.deliveryRadiusKm}km Radius</span>
              </div>
            </div>
          </div>
        </div>
        
        <span style={{
          ...styles.badge,
          backgroundColor: isOutletActive ? '#dcfce7' : '#fee2e2',
          color: isOutletActive ? '#15803d' : '#991b1b',
          border: isOutletActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
        }}>
          <Activity size={12} />
          {outlet.status}
        </span>
      </div>

      {/* Action Cards Grid */}
      <div style={styles.grid}>
        
        {/* --- Store Status Block --- */}
        <div style={{
           ...styles.actionBlock,
           // Grey out background if Outlet is INACTIVE (Super Admin disabled it)
           backgroundColor: !isOutletActive ? '#f8fafc' : (isStoreOpen ? '#f0fdf4' : 'white'),
           borderColor: !isOutletActive ? '#e2e8f0' : (isStoreOpen ? '#bbf7d0' : '#e2e8f0'),
           backgroundImage: !isOutletActive ? 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px)' : 'none',
        }}>
          <div style={styles.blockHeader}>
            <div style={styles.labelGroup}>
               {/* Change Icon to Lock if Inactive */}
               {!isOutletActive ? (
                 <Lock size={16} color="#94a3b8" />
               ) : (
                 <Store size={16} color={isStoreOpen ? '#15803d' : '#64748b'} />
               )}
               <span style={{
                 ...styles.label, 
                 color: !isOutletActive ? '#94a3b8' : (isStoreOpen ? '#15803d' : '#64748b')
               }}>
                 Store Status
               </span>
            </div>
            
            {/* Status Dot */}
            {isOutletActive && (
              <div style={{
                ...styles.statusDot,
                backgroundColor: isStoreOpen ? '#22c55e' : '#cbd5e1',
                boxShadow: isStoreOpen ? '0 0 0 4px #dcfce7' : 'none'
              }} />
            )}
          </div>
          
          <div style={styles.blockBody}>
             <span style={{
               ...styles.value, 
               color: !isOutletActive ? '#94a3b8' : (isStoreOpen ? '#166534' : '#1e293b')
             }}>
               {/* Display specific text if inactive */}
               {!isOutletActive ? "DISABLED" : outlet.workingState.status}
             </span>
             <p style={styles.helperText}>
               {!isOutletActive 
                 ? "Contact Super Admin to activate" 
                 : (isStoreOpen ? "Accepting new orders" : "Currently not accepting orders")
               }
             </p>
          </div>

          <div style={styles.blockFooter}>
            <button
              onClick={handleStatusToggle}
              disabled={loading || !isOutletActive} // DISABLE BUTTON HERE
              style={{
                ...styles.button,
                width: '100%',
                // Locked styling
                backgroundColor: !isOutletActive ? '#e2e8f0' : (isStoreOpen ? 'white' : '#16a34a'),
                border: !isOutletActive ? '1px solid #cbd5e1' : (isStoreOpen ? '1px solid #fee2e2' : '1px solid #16a34a'),
                color: !isOutletActive ? '#94a3b8' : (isStoreOpen ? '#ef4444' : 'white'),
                opacity: loading ? 0.7 : 1,
                cursor: !isOutletActive ? 'not-allowed' : 'pointer',
              }}
            >
              {!isOutletActive ? <Lock size={14} /> : <Power size={16} />}
              {loading 
                ? "Processing..." 
                : (!isOutletActive ? "Locked by Admin" : (isStoreOpen ? "Close Store" : "Open Store"))
              }
            </button>
          </div>
        </div>

        {/* --- AI Camera Block --- */}
        <div style={{
          ...styles.actionBlock,
          backgroundColor: !isStoreOpen ? '#f8fafc' : (isCameraOn ? '#eff6ff' : 'white'), 
          borderColor: !isStoreOpen ? '#e2e8f0' : (isCameraOn ? '#bfdbfe' : '#e2e8f0'),
          backgroundImage: !isStoreOpen ? 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px)' : 'none',
        }}>
          <div style={styles.blockHeader}>
             <div style={styles.labelGroup}>
               <Camera size={16} color={!isStoreOpen ? '#94a3b8' : (isCameraOn ? '#1d4ed8' : '#64748b')} />
               <span style={{
                 ...styles.label, 
                 color: !isStoreOpen ? '#94a3b8' : (isCameraOn ? '#1d4ed8' : '#64748b')
               }}>AI Camera</span>
            </div>
            {!isStoreOpen ? (
               <Lock size={16} color="#94a3b8" />
            ) : (
              <div style={{
                ...styles.statusDot,
                backgroundColor: isCameraOn ? '#3b82f6' : '#cbd5e1',
                boxShadow: isCameraOn ? '0 0 0 4px #dbeafe' : 'none'
              }} />
            )}
          </div>

          <div style={styles.blockBody}>
             <span style={{...styles.value, color: !isStoreOpen ? '#94a3b8' : (isCameraOn ? '#1e40af' : '#1e293b')}}>
               {outlet.cameraState.status}
             </span>
             <p style={styles.helperText}>
               {!isStoreOpen ? "Store must be open to use camera" : "Analytics and monitoring"}
             </p>
          </div>

          <div style={styles.blockFooter}>
            <button
              onClick={handleCameraToggle}
              disabled={loading || !isStoreOpen} 
              style={{
                ...styles.button,
                width: '100%',
                backgroundColor: !isStoreOpen ? '#e2e8f0' : (isCameraOn ? 'white' : '#2563eb'),
                border: !isStoreOpen 
                  ? '1px solid #cbd5e1' 
                  : (isCameraOn ? '1px solid #bfdbfe' : '1px solid #2563eb'),
                color: !isStoreOpen 
                  ? '#94a3b8' 
                  : (isCameraOn ? '#2563eb' : 'white'),
                cursor: !isStoreOpen ? 'not-allowed' : 'pointer',
              }}
            >
              {!isStoreOpen 
                ? <Lock size={14} />
                : <Power size={14} />
              }
              <span>
                {!isStoreOpen 
                  ? "Locked" 
                  : (loading ? "..." : (isCameraOn ? "Turn Off" : "Turn On"))
                }
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// 🎨 Professional Design System (Unchanged)
const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
    marginBottom: '24px',
    overflow: 'hidden',
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    marginBottom: '4px',
    letterSpacing: '-0.025em',
  },
  subInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: {
    color: '#cbd5e1',
    fontSize: '8px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.025em',
  },
  grid: {
    padding: '32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    backgroundColor: '#fff',
  },
  actionBlock: {
    padding: '24px',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    height: '180px', 
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  labelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  blockBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  value: {
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    marginBottom: '4px',
  },
  helperText: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  blockFooter: {
    marginTop: '16px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s active',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
};