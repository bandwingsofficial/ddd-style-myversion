'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; // Added for FlashMessage
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Search, Trash2, Edit2, CheckCircle2, 
  XCircle, IndianRupee, Tag, ShoppingBag, Loader2, Store,
  AlertTriangle 
} from 'lucide-react';
import { UsersService } from '@/features/users/users.service';
import { OutletProduct } from '@/features/users/users.types';
import { axiosInstance } from '@/http/axios';

// --- HELPER COMPONENTS ---

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <XCircle size={20}/>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function OutletProductsPage() {
  const router = useRouter();
  const params = useParams();
  const outletId = Array.isArray(params?.outletId) ? params.outletId[0] : params?.outletId as string;

  const [products, setProducts] = useState<OutletProduct[]>([]);
  const [masterProducts, setMasterProducts] = useState<any[]>([]); 
  const [outletName, setOutletName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState<OutletProduct | null>(null);
  
  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Flash Message State
  const [flashMessage, setFlashMessage] = useState<{ 
    title: string; 
    text: string; 
    type: 'success' | 'error' 
  } | null>(null);

  // Form Data
  const [selectedProductId, setSelectedProductId] = useState('');
  const [priceOverride, setPriceOverride] = useState('');
  const [discountOverride, setDiscountOverride] = useState('');

  // Map Helper
  const [productMap, setProductMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (outletId) loadData();
  }, [outletId]);

  // Auto-hide flash message
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setFlashMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  // --- SAFE NAME EXTRACTOR ---
  const getSafeName = (product: any) => {
    if (!product) return 'Unknown Product';
    if (typeof product.name === 'string') return product.name;
    if (typeof product.name === 'object' && product.name?.value) return product.name.value;
    return 'Unnamed Product';
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [outletRes, masterRes, outletDetailsRes] = await Promise.all([
        UsersService.getOutletProducts(outletId),
        UsersService.getMasterProducts(),
        axiosInstance.get(`/outlets/${outletId}`)
      ]);

      const outletData = outletRes.data.data || [];
      const masterData = masterRes.data.data || [];
      const outletDetails = outletDetailsRes.data.data || outletDetailsRes.data;

      setProducts(outletData);
      setMasterProducts(masterData);
      setOutletName(outletDetails.name || 'Unknown Outlet');

      const map: Record<string, string> = {};
      masterData.forEach((p: any) => { 
        map[p.id] = getSafeName(p); 
      });
      setProductMap(map);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleCreateProduct = async () => {
    if (!selectedProductId) return;
    try {
      await UsersService.assignProductToOutlet(outletId, selectedProductId);
      setShowCreateModal(false);
      setSelectedProductId('');
      loadData(); 
      setFlashMessage({
        type: 'success',
        title: 'Product Added',
        text: 'The product has been successfully added to this outlet.'
      });
    } catch (error) {
      setFlashMessage({
        type: 'error',
        title: 'Creation Failed',
        text: 'Failed to assign product to this outlet. Please try again.'
      });
    }
  };

  const handleToggleStatus = async (item: OutletProduct) => {
    try {
      if (item.isAvailable) {
        await UsersService.disableOutletProduct(outletId, item.productId);
      } else {
        await UsersService.enableOutletProduct(outletId, item.productId);
      }
      loadData();
    } catch (error) {
      console.error(error);
      setFlashMessage({
        type: 'error',
        title: 'Update Failed',
        text: 'Could not change product status.'
      });
    }
  };

  // Trigger Delete Confirmation
  const handleDeleteClick = (productId: string) => {
    setItemToDelete(productId);
  };

  // Execute Delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await UsersService.removeProductFromOutlet(outletId, itemToDelete);
      setItemToDelete(null);
      loadData();
      setFlashMessage({
        type: 'success',
        title: 'Product Removed',
        text: 'The product has been removed from this outlet.'
      });
    } catch (error) {
      console.error(error);
      setFlashMessage({
        type: 'error',
        title: 'Removal Failed',
        text: 'Could not remove the product.'
      });
    }
  };

  const handlePriceUpdate = async () => {
    if (!showPriceModal) return;
    try {
      await UsersService.overrideProductPrice(
        outletId, 
        showPriceModal.productId, 
        Number(priceOverride), 
        Number(discountOverride)
      );
      setShowPriceModal(null);
      loadData();
      setFlashMessage({
        type: 'success',
        title: 'Pricing Updated',
        text: 'Price and discount overrides saved successfully.'
      });
    } catch (error) {
      setFlashMessage({
        type: 'error',
        title: 'Update Failed',
        text: 'Failed to update pricing details.'
      });
    }
  };

  const availableToAdd = masterProducts.filter(
    mp => !products.find(op => op.productId === mp.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-2 font-sans md:p-4">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                        <Store size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            {loading ? 'Loading...' : outletName}
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Manage catalog availability for this location
                        </p>
                    </div>
                </div>
              
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
                >
                    <Plus size={18} strokeWidth={2.5} /> Create Product
                </button>
            </div>
        </div>

        {/* LIST TABLE */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
             <div className="flex h-64 flex-col items-center justify-center">
               <Loader2 size={32} className="animate-spin text-emerald-500"/>
               <p className="mt-2 text-sm text-slate-400">Loading products...</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Price Override</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">
                              {productMap[item.productId] || 'Unknown Product'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                          <button 
                           onClick={() => handleToggleStatus(item)}
                           className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all ${
                             item.isAvailable 
                               ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                               : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                           }`}
                          >
                           {item.isAvailable ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                           {item.isAvailable ? 'Active' : 'Inactive'}
                          </button>
                      </td>

                      <td className="px-6 py-4">
                        {(item.priceOverride || item.discountOverride) ? (
                          <div className="flex flex-col text-sm">
                            {item.priceOverride && (
                               <span className="font-medium text-emerald-600 flex items-center gap-1">
                                 <IndianRupee size={12}/> {item.priceOverride}
                               </span>
                            )}
                            {item.discountOverride && (
                               <span className="font-medium text-orange-600 flex items-center gap-1">
                                 <Tag size={12}/> {item.discountOverride}% Off
                               </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Default</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setPriceOverride(item.priceOverride?.toString() || '');
                              setDiscountOverride(item.discountOverride?.toString() || '');
                              setShowPriceModal(item);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item.productId)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        No products assigned. Click "Create Product" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE PRODUCT MODAL --- */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal title="Create Outlet Product" onClose={() => setShowCreateModal(false)}>
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-sm text-slate-600">
                  Select a product from the master list to add to this outlet.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Select Product</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Choose Product --</option>
                    {availableToAdd.map(p => (
                      <option key={p.id} value={p.id}>{getSafeName(p)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={18} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCreateProduct}
                disabled={!selectedProductId}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                <Plus size={18} strokeWidth={2.5} />
                Create Product
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- PRICE MODAL --- */}
      <AnimatePresence>
        {showPriceModal && (
          <Modal title="Edit Pricing" onClose={() => setShowPriceModal(null)}>
             <div className="space-y-5">
               <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 mb-4">
                 Editing: <strong>{productMap[showPriceModal.productId]}</strong>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="mb-1.5 block text-xs font-bold text-slate-500">New Price</label>
                   <input 
                     type="number" 
                     value={priceOverride}
                     onChange={e => setPriceOverride(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
                   />
                 </div>
                 <div>
                   <label className="mb-1.5 block text-xs font-bold text-slate-500">Discount %</label>
                   <input 
                     type="number" 
                     value={discountOverride}
                     onChange={e => setDiscountOverride(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
                   />
                 </div>
               </div>

               <button 
                onClick={handlePriceUpdate}
                className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Save Changes
              </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {itemToDelete && (
          <Modal title="Confirm Removal" onClose={() => setItemToDelete(null)}>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3 text-red-500">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <p className="mb-6 text-sm text-slate-600">
                Are you sure you want to remove this product from the outlet? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-md shadow-red-200 transition-colors hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- FLASH MESSAGE --- */}
      <AnimatePresence>
        {flashMessage && (
          <FlashMessage 
            title={flashMessage.title} 
            text={flashMessage.text} 
            type={flashMessage.type} 
            onClose={() => setFlashMessage(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// --- FLASH MESSAGE COMPONENT ---
function FlashMessage({ title, text, type, onClose }: any) {
  return createPortal(
    <div className="fixed top-6 right-6 z-[200] flex w-full max-w-sm flex-col gap-2">
      <motion.div 
        initial={{ opacity: 0, x: 50 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: 50 }} 
        className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200"
      >
        <div className={`mt-0.5 rounded-full p-2 ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-bold ${type === 'success' ? 'text-emerald-900' : 'text-rose-900'}`}>
            {title}
          </h4>
          <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">
            {text}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <XCircle size={18} />
        </button>
      </motion.div>
    </div>,
    document.body
  );
}