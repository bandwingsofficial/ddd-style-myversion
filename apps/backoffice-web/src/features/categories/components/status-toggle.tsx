'use client';

import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';
import { useState } from 'react';
import { Power } from 'lucide-react';

export default function StatusToggle({
  category,
  onChange,
}: {
  category: Category;
  onChange: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isActive = category.status === 'ACTIVE';

  const toggle = async () => {
    // FIX: Removed the confirm() check. Action is now immediate.
    try {
      setLoading(true);
      if (isActive) {
        await CategoriesApi.disable(category.id);
      } else {
        await CategoriesApi.enable(category.id);
      }
      onChange();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isActive ? "Deactivate" : "Activate"}
      style={{
        background: isActive ? '#dcfce7' : '#f1f5f9', // Light green bg if active
        border: '1px solid',
        borderColor: isActive ? '#86efac' : '#e2e8f0',
        borderRadius: '6px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: isActive ? '#16a34a' : '#94a3b8' // Green icon vs Gray icon
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
           e.currentTarget.style.borderColor = '#94a3b8';
           e.currentTarget.style.color = '#64748b';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
           e.currentTarget.style.borderColor = '#e2e8f0';
           e.currentTarget.style.color = '#94a3b8';
        }
      }}
    >
      <Power size={16} />
    </button>
  );
}