'use client';

import { outletProfileService } from '../services/outletProfile.service';

export default function OutletProfileDangerZone({
  outletId,
  onDeleted,
}: {
  outletId: string;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    if (!confirm('Delete outlet profile permanently?')) return;
    await outletProfileService.delete(outletId);
    onDeleted();
  };

  return (
    <div style={styles.box}>
      <h3>Danger Zone</h3>
      <button onClick={handleDelete} style={styles.btn}>
        Delete Profile
      </button>
    </div>
  );
}

const styles = {
  box: {
    marginTop: '24px',
    padding: '16px',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    background: '#fff1f2',
  },
  btn: {
    background: '#dc2626',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
};
