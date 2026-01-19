'use client';

import { useState, useEffect } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenameCategoryModal({ category, isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setFeedback(null);
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name.trim()) return;

    try {
      setLoading(true);
      await CategoriesApi.rename(category.id, name);
      
      // SUCCESS
      setFeedback({ type: 'success', message: 'Category updated successfully' });
      setTimeout(() => {
        onSuccess();
        onClose();
        setFeedback(null);
      }, 1500);

    } catch (error) {
      // ERROR HANDLING
      // Note: The browser will still print a red 400 error line. This is normal.
      // We catch it here to show the popup.
      setFeedback({ 
        type: 'error', 
        message: 'Failed to rename. Category might be closed or invalid.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', width: '400px',
        padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Rename Category</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Category Name
          </label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            disabled={loading || feedback?.type === 'success'}
            style={{
              width: '100%', padding: '10px', borderRadius: '6px',
              border: '1px solid #e2e8f0', marginBottom: '20px', outline: 'none', fontSize: '14px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button" onClick={onClose} disabled={loading}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0',
                background: 'white', cursor: 'pointer', fontWeight: 600, color: '#64748b'
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading || !name.trim() || feedback?.type === 'success'}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none',
                background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 600,
                opacity: (loading || feedback?.type === 'success') ? 0.7 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* FEEDBACK POPUP */}
        {feedback && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255, 0.95)', borderRadius: '12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 60
          }}>
            {feedback.type === 'success' ? (
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
            ) : (
              <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            )}
            
            <p style={{ 
              margin: '0 0 16px 0', fontWeight: 600, 
              color: feedback.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '16px', textAlign: 'center', padding: '0 20px'
            }}>
              {feedback.message}
            </p>

            {feedback.type === 'error' && (
              <button 
                onClick={() => setFeedback(null)}
                style={{
                  padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderRadius: '6px',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#475569'
                }}
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}