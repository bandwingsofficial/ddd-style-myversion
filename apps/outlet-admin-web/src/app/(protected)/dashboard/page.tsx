'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSession';
import { useOrders } from '../../../features/orders/hooks/useOrders';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, AlertCircle, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { loading: sessionLoading } = useSessionGuard();
  const { columns, loading: ordersLoading } = useOrders();

  // --- REAL-TIME DATA ENGINE ---
  const { stats, chartData, liveAlerts } = useMemo(() => {
    if (!columns) return { stats: null, chartData: [], liveAlerts: [] };

    const allOrders = Object.values(columns).flat();
    const now = new Date();
    const todayStr = now.toDateString();
    
    // 1. Calculate Today's Stats
    const todayOrders = allOrders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
    const todayRevenue = todayOrders.reduce((sum, o) => o.status === 'DELIVERED' ? sum + o.grandTotal : sum, 0);

    // 2. Generate Real 7-Day Chart Data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return d.toDateString();
    }).reverse();

    const dailyData = last7Days.map(dateStr => {
      const dayOrders = allOrders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
      return {
        name: new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' }),
        sales: dayOrders.reduce((sum, o) => o.status === 'DELIVERED' ? sum + o.grandTotal : sum, 0),
        count: dayOrders.length
      };
    });

    // 3. Live Kitchen Alerts (Prioritize NEW orders)
    const alerts = [
      ...(columns.NEW || []).map(o => ({ ...o, type: 'URGENT' })),
      ...(columns.PREPARING || []).map(o => ({ ...o, type: 'PREPARING' }))
    ].slice(0, 5);

    return {
      stats: {
        revenue: todayRevenue,
        orders: todayOrders.length,
        pending: (columns.NEW?.length || 0) + (columns.PREPARING?.length || 0),
      },
      chartData: dailyData,
      liveAlerts: alerts
    };
  }, [columns]);

  if (sessionLoading || ordersLoading) {
    return (
      <div style={styles.loader}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Clock size={32} color="#94a3b8" />
        </motion.div>
        <p>Syncing Live Data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Outlet Insights</h1>
        <p style={styles.subtitle}>Performance Overview for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
      </header>

      {/* KPI Section */}
      <div style={styles.statsGrid}>
        <StatCard 
          title="Today's Revenue" 
          value={`₹${stats?.revenue.toLocaleString('en-IN')}`} 
          icon={<TrendingUp size={20} />} 
          color="#10b981" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.orders.toString()} 
          icon={<ShoppingBag size={20} />} 
          color="#3b82f6" 
        />
        <StatCard 
          title="Pending Action" 
          value={stats?.pending.toString()} 
          icon={<AlertCircle size={20} />} 
          color="#f59e0b" 
        />
      </div>

      <div style={styles.mainGrid}>
        {/* Real Dynamic Chart */}
        <div style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Weekly Sales Velocity</h3>
            <p style={styles.cardSub}>Revenue generated from delivered orders</p>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Order Stream */}
        <div style={styles.activityCard}>
          <h3 style={styles.cardTitle}>Live Kitchen Feed</h3>
          <div style={styles.activityList}>
            {liveAlerts.length > 0 ? liveAlerts.map((order: any) => (
              <div key={order.id} style={styles.activityRow}>
                <div style={{...styles.activityDot, backgroundColor: order.type === 'URGENT' ? '#ef4444' : '#f59e0b'}} />
                <div style={{ flex: 1 }}>
                  <p style={styles.activityText}><b>#{order.id.slice(-5).toUpperCase()}</b> — {order.items[0]?.productName}</p>
                  <p style={styles.activitySubtext}>{order.items.length} items • ₹{order.grandTotal}</p>
                </div>
                <span style={{...styles.miniBadge, backgroundColor: order.type === 'URGENT' ? '#fee2e2' : '#fef3c7'}}>
                    {order.status}
                </span>
              </div>
            )) : (
              <div style={styles.emptyState}>
                 <p>All orders dispatched! 🚀</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components & Styles (Rest remains similar but cleaned up) ---
function StatCard({ title, value, icon, color }: any) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} style={styles.statCard}>
        <div style={{ ...styles.statIcon, backgroundColor: `${color}15`, color: color }}>{icon}</div>
        <div style={{ marginTop: '16px' }}>
          <p style={styles.statLabel}>{title}</p>
          <h4 style={styles.statValue}>{value || '0'}</h4>
        </div>
      </motion.div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'inherit' },
  header: { marginBottom: '40px' },
  title: { fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' },
  statCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
  statIcon: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' },
  chartCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' },
  activityCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' },
  cardHeader: { marginBottom: '32px' },
  cardTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 },
  cardSub: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  activityRow: { display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f8fafc' },
  activityDot: { width: '8px', height: '8px', borderRadius: '50%' },
  activityText: { fontSize: '14px', margin: 0, color: '#1e293b' },
  activitySubtext: { fontSize: '12px', margin: 0, color: '#94a3b8' },
  miniBadge: { fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', color: '#92400e' },
  loader: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#94a3b8' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }
};