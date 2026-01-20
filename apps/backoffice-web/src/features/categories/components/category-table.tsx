'use client';

import { useState } from 'react';
import { Category } from '../types/category.types';
import StatusToggle from './status-toggle';
import { Pencil, Image as ImageIcon, ImageOff } from 'lucide-react';
import RenameCategoryModal from './rename-category-modal';

// UPDATED: Matches the URL seen in your console logs
const BASE_IMAGE_URL = 'https://api.dev.local:4000/'; 

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
    color: '#94a3b8',
    letterSpacing: '0.05em'
  };

  const cellStyle = { padding: '12px 24px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' as const };

  return (
    <>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Image</th>
              <th style={headerStyle}>Category Name</th>
              <th style={headerStyle}>Subtitle</th>
              <th style={headerStyle}>Status</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const isActive = (cat.status?.toString().toUpperCase() === 'ACTIVE') || (cat.isActive === true);
              const isInactive = !isActive;

              const rowStyle = {
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              };

              const firstCellStyle = { borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' };
              const lastCellStyle = { borderTopRightRadius: '12px', borderBottomRightRadius: '12px' };

              // LOGIC: Construct full URL by combining Base URL + Relative Path from DB
              const imageSrc = cat.imagePath 
                ? (cat.imagePath.startsWith('http') 
                    ? cat.imagePath 
                    : `${BASE_IMAGE_URL}${cat.imagePath}`)
                : null;

              return (
                <tr key={cat.id} style={rowStyle}>
                  
                  {/* 1. Image Column */}
                  <td style={{ ...cellStyle, ...firstCellStyle, width: '80px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e2e8f0',
                      position: 'relative'
                    }}>
                      {imageSrc ? (
                        <>
                            <img 
                              src={imageSrc} 
                              alt={cat.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                 e.currentTarget.style.display = 'none'; // Hide broken image
                                 // Show the fallback icon underneath
                                 const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                 if(fallback) fallback.style.display = 'flex';
                              }}
                            />
                            {/* Fallback Icon (Hidden initially, shown if img fails) */}
                            <div 
                                style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    display: 'none', // Hidden by default
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    zIndex: 0
                                }}
                            >
                                <ImageOff size={18} color="#94a3b8" />
                            </div>
                        </>
                      ) : (
                        <ImageIcon size={20} color="#cbd5e1" />
                      )}
                    </div>
                  </td>

                  {/* 2. Name Column */}
                  <td style={{ ...cellStyle, fontWeight: 600, color: '#1e293b' }}>
                    {cat.name}
                  </td>

                  {/* 3. Subtitle Column */}
                  <td style={{ ...cellStyle, color: '#64748b', maxWidth: '300px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.subtitle || '-'}
                    </div>
                  </td>

                  {/* 4. Status Column */}
                  <td style={cellStyle}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
                        color: isActive ? '#15803d' : '#94a3b8',
                        display: 'inline-block',
                        minWidth: '80px',
                        textAlign: 'center',
                        letterSpacing: '0.02em'
                      }}>
                        {isActive ? 'Active' : 'Closed'}
                      </span>
                  </td>

                  {/* 5. Actions Column */}
                  <td style={{ ...cellStyle, ...lastCellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                      <StatusToggle category={cat} onChange={onRefresh} />
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
        onSuccess={onRefresh}
      />
    </>
  );
}