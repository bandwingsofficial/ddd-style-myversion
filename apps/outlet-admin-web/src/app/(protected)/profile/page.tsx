'use client';

import { useEffect, useState } from 'react';
import OutletProfileForm from '@/features/outlet/components/OutletProfileForm';
import OutletProfileDangerZone from '@/features/outlet/components/OutletProfileDangerZone';
import { useOutletProfile } from '@/features/outlet/hooks/useOutletProfile';
import { outletService } from '@/features/outlet/services/outletService';
import { Outlet } from '@/features/outlet/types';

type Mode = 'create' | 'view' | 'edit';

export default function OutletProfilePage() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loadingOutlet, setLoadingOutlet] = useState(true);
  const [mode, setMode] = useState<Mode>('view');

  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const data = await outletService.getOutlet();
        setOutlet(data);
      } catch {
        setOutlet(null);
      } finally {
        setLoadingOutlet(false);
      }
    };
    fetchOutlet();
  }, []);

  const outletId = outlet?.id ?? '';
  const { profile, loading, refresh } = useOutletProfile(outletId);

  useEffect(() => {
    if (!profile) setMode('create');
    else setMode('view');
  }, [profile]);

  if (loadingOutlet || loading) {
    return <p style={{ padding: 32 }}>Loading…</p>;
  }

  if (!outlet) {
    return <p style={{ padding: 32, color: '#dc2626' }}>Outlet not found</p>;
  }

  return (
    <div style={page}>
      {/* Page Header */}
      <div style={header}>
        <div>
          <h1 style={title}>Outlet Profile</h1>
          <p style={subtitle}>
            Manage your outlet’s public and business information
          </p>
        </div>

        {mode === 'view' && profile && (
          <button style={editBtn} onClick={() => setMode('edit')}>
            Edit Profile
          </button>
        )}
      </div>

      {/* VIEW MODE */}
      {mode === 'view' && profile && (
        <div style={card}>
          <div style={grid}>
            <ProfileItem label="Owner Name" value={profile.ownerName} />
            <ProfileItem label="Contact Phone" value={profile.contactPhone} />
            <ProfileItem label="Contact Email" value={profile.contactEmail} />
            <ProfileItem label="GST Number" value={profile.gstNumber} />
            <ProfileItem label="FSSAI Number" value={profile.fssaiNumber} />
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={descLabel}>Description</div>
            <div style={descValue}>{profile.description}</div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODE */}
      {(mode === 'create' || mode === 'edit') && (
        <OutletProfileForm
          outletId={outletId}
          profile={mode === 'edit' ? profile : null}
          isEdit={mode === 'edit'}
          onCancel={() => setMode('view')}
          onSuccess={() => {
            refresh();
            setMode('view');
          }}
        />
      )}

      {mode === 'view' && profile && (
        <OutletProfileDangerZone
          outletId={outletId}
          onDeleted={refresh}
        />
      )}
    </div>
  );
}

/* ---------- UI Helpers ---------- */

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={itemLabel}>{label}</div>
      <div style={itemValue}>{value}</div>
    </div>
  );
}

/* ---------- Styles ---------- */

const page = {
  maxWidth: 960,
  margin: '0 auto',
  padding: 32,
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 24,
};

const title = {
  fontSize: 24,
  fontWeight: 700,
  color: '#0f172a',
};

const subtitle = {
  marginTop: 4,
  fontSize: 14,
  color: '#64748b',
};

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 24,
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 24,
};

const itemLabel = {
  fontSize: 13,
  color: '#64748b',
  marginBottom: 4,
};

const itemValue = {
  fontSize: 15,
  fontWeight: 600,
  color: '#0f172a',
};

const descLabel = {
  fontSize: 13,
  color: '#64748b',
  marginBottom: 6,
};

const descValue = {
  fontSize: 15,
  color: '#0f172a',
  lineHeight: 1.6,
};

const editBtn = {
  background: '#2563eb',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
};
