'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function DashboardPage() {
  const { actorType, actorId, sessionId } = useAuth();

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b' }}>System health and active session data</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Status Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>SESSION STATUS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Active</div>
          <div style={{ height: '4px', width: '40px', backgroundColor: '#10b981', marginTop: '12px', borderRadius: '2px' }} />
        </div>

        {/* Role Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>ROLE TYPE</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{actorType}</div>
          <div style={{ height: '4px', width: '40px', backgroundColor: '#3b82f6', marginTop: '12px', borderRadius: '2px' }} />
        </div>
      </div>

      {/* Session Details Section */}
      <div style={{ marginTop: '30px', backgroundColor: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Active Authentication Session</h3>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>ACTOR IDENTIFIER</span>
            <div style={{ fontWeight: 700, fontFamily: 'monospace', marginTop: '4px' }}>{actorId}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>SESSION TOKEN</span>
            <div style={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace', marginTop: '4px', wordBreak: 'break-all' }}>{sessionId}</div>
          </div>
        </div>
      </div>
    </>
  );
}