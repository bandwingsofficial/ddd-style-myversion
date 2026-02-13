'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { outletProfileService } from '../services/outletProfile.service';

export default function OutletProfileDangerZone({
  outletId,
  onDeleted,
}: {
  outletId: string;
  onDeleted: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await outletProfileService.delete(outletId);
      onDeleted();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete profile. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Main Delete Button */}
      <button 
        onClick={() => setShowConfirm(true)} 
        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-red-100"
      >
        <Trash2 size={16} />
        Delete Profile
      </button>

      {/* Confirmation Pop Message (Modal Overlay) */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => !isDeleting && setShowConfirm(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">Delete Profile?</h3>
              <p className="text-sm text-slate-500 mt-2">
                This action is permanent and cannot be undone. All your outlet data will be removed.
              </p>

              <div className="flex flex-col w-full gap-2 mt-6">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Yes, Delete Everything'}
                </button>
                
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-all border border-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Close Icon for convenience */}
            {!isDeleting && (
              <button 
                onClick={() => setShowConfirm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}