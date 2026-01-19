'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCategories } from '../hooks/use-categories';
import CategoryTable from '../components/category-table';
import CreateCategoryModal from '../components/create-category-modal';

export default function CategoriesPage() {
  const { categories, loading, refresh } = useCategories();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* --- Page Header Section --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Categories
          </h1>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#64748b' }}>
            Super Admin Control Panel | Manage product categories
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Gradient
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '2px', display: 'flex' }}>
            <Plus size={16} />
          </div>
          Create Category
        </button>
      </div>

      {/* --- Content Card --- */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '4px' }}>
          <CategoryTable
            categories={categories}
            loading={loading}
            onRefresh={refresh}
          />
        </div>
      </div>

      {/* Modal Component */}
      <CreateCategoryModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}