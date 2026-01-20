'use client';

import { useState, ChangeEvent } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function CreateCategoryModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sortOrder, setSortOrder] = useState('1');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // New state for error messages
  const [error, setError] = useState('');

  if (!open) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(''); // Clear previous errors

    if (file) {
      // VALIDATION: Check if file is larger than 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('File is too large. Please choose an image under 5MB.');
        return;
      }
      setImage(file);
    }
  };

  const submit = async () => {
    if (!name.trim() || !subtitle.trim()) return;
    setError('');

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('sortOrder', sortOrder || '1');
      
      if (image) {
        formData.append('image', image);
      }

      await CategoriesApi.create(formData);
      
      // Reset form
      setName('');
      setSubtitle('');
      setSortOrder('1');
      setImage(null);
      setError('');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create category", err);
      // specific check for the 413 error if it still slips through
      if (err.response?.status === 413) {
        setError('Image is still too large for the server. Try a smaller file.');
      } else {
        setError('Failed to create category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '8px',
    textTransform: 'uppercase' as const
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: '16px'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Create Category</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          
          {/* Error Alert */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#ef4444',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <label style={labelStyle}>Category Name *</label>
          <input
            type="text"
            placeholder="e.g. Hot Drinks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Subtitle *</label>
          <input
            type="text"
            placeholder="e.g. New arrivals"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Cover Image (Max 5MB)</label>
          <div style={{
            border: error && image === null ? '2px dashed #ef4444' : '2px dashed #e2e8f0', // Red border on error
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            position: 'relative',
            cursor: 'pointer',
          }}>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
              {image ? (
                <>
                   <ImageIcon size={32} color="#10b981" />
                   <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 600 }}>{image.name}</span>
                   <span style={{ fontSize: '12px', color: '#64748b' }}>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                </>
              ) : (
                <>
                  <Upload size={24} />
                  <span style={{ fontSize: '13px' }}>Click to upload image</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#475569',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || !name || !subtitle || !!error} // Disable if there is an error
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: (loading || !name || !subtitle || !!error) ? '#94a3b8' : '#10b981',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (loading || !name || !subtitle || !!error) ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}