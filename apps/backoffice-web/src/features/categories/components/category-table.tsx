'use client';

import { useState } from 'react';
import { Category } from '../types/category.types';
import StatusToggle from './status-toggle';
import { Pencil } from 'lucide-react';
import RenameCategoryModal from './rename-category-modal';

interface Props {
  categories: Category[];
  loading: boolean;
  onRefresh: () => void;
}

export default function CategoryTable({ categories, loading, onRefresh }: Props) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading data...</div>;

  const headerStyle = {
    textAlign: 'left' as const,
    padding: '12px 24px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: '#94a3b8', // Lighter header text
    letterSpacing: '0.05em'
  };

  const cellStyle = { padding: '8px 8px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' as const };

  return (
    <>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Category Name</th>
              <th style={headerStyle}>Status</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              // --- STATUS LOGIC ---
              const isActive = 
                (cat.status?.toString().toUpperCase() === 'ACTIVE') || 
                (cat.isActive === true);
              
              const isInactive = !isActive;

              // --- ROW STYLING (Card Look) ---
              const rowStyle = {
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)', // Subtle shadow
                borderRadius: '8px', // Note: Border radius on tr requires specific CSS handling usually, but works in modern browsers or via td logic
                transition: 'all 0.2s ease',
              };

              // Helper for rounded corners on first/last cells
              const firstCellStyle = { borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' };
              const lastCellStyle = { borderTopRightRadius: '12px', borderBottomRightRadius: '12px' };

              return (
                <tr key={cat.id} style={rowStyle}>
                  
                  {/* 1. Name Column */}
                  <td style={{ ...cellStyle, ...firstCellStyle, fontWeight: 600, color: '#1e293b' }}>
                    {cat.name}
                  </td>

                  {/* 2. Status Column (Badge) */}
                  <td style={cellStyle}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        backgroundColor: isActive ? '#dcfce7' : '#f1f5f9', // Light green vs Light gray
                        color: isActive ? '#15803d' : '#94a3b8', // Dark green vs Gray text
                        display: 'inline-block',
                        minWidth: '80px',
                        textAlign: 'center',
                        letterSpacing: '0.02em'
                      }}>
                        {isActive ? 'Active' : 'Closed'}
                      </span>
                  </td>

                  {/* 3. Actions Column (Switch + Edit) */}
                  <td style={{ ...cellStyle, ...lastCellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                      
                      {/* Toggle Switch */}
                      <StatusToggle category={cat} onChange={onRefresh} />

                      {/* Edit Button */}
                      <button 
                        disabled={isInactive}
                        onClick={() => setEditingCategory(cat)}
                        title={isInactive ? "Category closed" : "Rename category"}
                        style={{
                          border: '1px solid #f1f5f9',
                          background: 'white',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: isInactive ? 'not-allowed' : 'pointer',
                          opacity: isInactive ? 0.4 : 1,
                          color: '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          height: '36px',
                          width: '36px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isInactive) {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#334155';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#f1f5f9';
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RenameCategoryModal 
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={() => {
          onRefresh();
        }}
      />
    </>
  );
}