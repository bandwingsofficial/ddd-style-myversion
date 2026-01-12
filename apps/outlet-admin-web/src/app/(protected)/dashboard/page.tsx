'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSession';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, TrendingUp, ShoppingBag, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const { loading } = useSessionGuard();

  if (loading) return null;

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Outlet Dashboard</h1>
          <p style={styles.subtitle}>Welcome back! Here is what's happening at your location today.</p>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Orders" value="1,284" icon={<ShoppingBag size={20} />} trend="+12.5%" />
        <StatCard title="Revenue" value="₹42,850" icon={<TrendingUp size={20} />} trend="+8.2%" />
        <StatCard title="Active Users" value="14" icon={<Users size={20} />} trend="Stable" />
      </div>

      {/* Content Placeholder for Pro Look */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.mainCard}
      >
        <div style={styles.cardHeader}>
          <LayoutDashboard size={18} color="#10b981" />
          <h3 style={styles.cardTitle}>Recent Activity</h3>
        </div>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No recent activities to display yet.</p>
        </div>
      </motion.div>
    </div>
  );
}

// --- Helper Component ---
function StatCard({ title, value, icon, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      style={styles.statCard}
    >
      <div style={styles.statHeader}>
        <div style={styles.statIcon}>{icon}</div>
        <span style={styles.trendBadge}>{trend} <ArrowUpRight size={12} /></span>
      </div>
      <h4 style={styles.statLabel}>{title}</h4>
      <p style={styles.statValue}>{value}</p>
    </motion.div>
  );
}

// --- Professional Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingBottom: '40px',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#1e293b',
    letterSpacing: '-0.025em',
    margin: 0,
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    marginTop: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '4px 8px',
    borderRadius: '100px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    minHeight: '300px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  emptyState: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '14px',
  },
};