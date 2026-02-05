'use client';

import { useState } from 'react';
import {
  OutletProfile,
  CreateOutletProfilePayload,
} from '../types/outletProfile.types';
import { outletProfileService } from '../services/outletProfile.service';

interface Props {
  outletId: string;
  profile: OutletProfile | null;
  isEdit: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OutletProfileForm({
  outletId,
  profile,
  isEdit,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState<CreateOutletProfilePayload>({
    logoUrl: profile?.logoUrl ?? '',
    bannerUrl: profile?.bannerUrl ?? '',
    contactPhone: profile?.contactPhone ?? '',
    contactEmail: profile?.contactEmail ?? '',
    ownerName: profile?.ownerName ?? '',
    description: profile?.description ?? '',
    gstNumber: profile?.gstNumber ?? '',
    fssaiNumber: profile?.fssaiNumber ?? '',
  });

  const handleSubmit = async () => {
    if (isEdit) {
      await outletProfileService.update(outletId, form);
    } else {
      await outletProfileService.create(outletId, form);
    }
    onSuccess();
  };

  return (
    <div style={card}>
      <h2 style={title}>
        {isEdit ? 'Edit Outlet Profile' : 'Create Outlet Profile'}
      </h2>

      <div style={formGrid}>
        {renderInput('Logo URL', 'logoUrl')}
        {renderInput('Banner URL', 'bannerUrl')}
        {renderInput('Contact Phone', 'contactPhone')}
        {renderInput('Contact Email', 'contactEmail')}
        {renderInput('Owner Name', 'ownerName')}
        {renderInput('GST Number', 'gstNumber')}
        {renderInput('FSSAI Number', 'fssaiNumber')}
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={label}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          style={textarea}
        />
      </div>

      <div style={footer}>
        <button onClick={handleSubmit} style={primaryBtn}>
          {isEdit ? 'Save Changes' : 'Create Profile'}
        </button>

        {isEdit && (
          <button onClick={onCancel} style={secondaryBtn}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  function renderInput(labelText: string, key: keyof CreateOutletProfilePayload) {
    return (
      <div>
        <label style={label}>{labelText}</label>
        <input
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={input}
        />
      </div>
    );
  }
}

/* ---------- Styles ---------- */

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 24,
};

const title = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 20,
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 16,
};

const label = {
  display: 'block',
  fontSize: 13,
  color: '#475569',
  marginBottom: 6,
};

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  outline: 'none',
};

const textarea = {
  width: '100%',
  minHeight: 90,
  padding: 12,
  borderRadius: 8,
  border: '1px solid #d1d5db',
  resize: 'vertical' as const,
};

const footer = {
  marginTop: 24,
  display: 'flex',
  gap: 12,
};

const primaryBtn = {
  background: '#2563eb',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtn = {
  background: '#e5e7eb',
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
};
