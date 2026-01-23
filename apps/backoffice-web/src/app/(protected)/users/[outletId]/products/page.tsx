'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Search, Trash2, Edit2, CheckCircle2, 
  XCircle, IndianRupee, Tag, ShoppingBag, Loader2 
} from 'lucide-react';
import { UsersService } from '@/features/users/users.service';
import { OutletProduct } from '@/features/users/users.types';

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
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState<OutletProduct | null>(null);

  // Form Data
  const [selectedProductId, setSelectedProductId] = useState('');
  const [priceOverride, setPriceOverride] = useState('');
  const [discountOverride, setDiscountOverride] = useState('');

  // Map Helper
  const [productMap, setProductMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (outletId) loadData();
  }, [outletId]);

  // --- SAFE NAME EXTRACTOR ---
  // This function fixes the crash by handling both strings and objects
  const getSafeName = (product: any) => {
    if (!product) return 'Unknown Product';
    // If name is just "Burger"
    if (typeof product.name === 'string') return product.name;
    // If name is { value: "Burger" } (The cause of your error)
    if (typeof product.name === 'object' && product.name?.value) return product.name.value;
    // Fallback
    return 'Unnamed Product';
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [outletRes, masterRes] = await Promise.all([
        UsersService.getOutletProducts(outletId),
        UsersService.getMasterProducts()
      ]);

      const outletData = outletRes.data.data || [];
      const masterData = masterRes.data.data || [];

      setProducts(outletData);
      setMasterProducts(masterData);

      // Build Map using the safe name extractor
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
    } catch (error) {
      alert("Failed to create product for this outlet.");
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
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Remove this product?")) return;
    try {
      await UsersService.removeProductFromOutlet(outletId, productId);
      loadData();
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      alert("Failed to update pricing.");
    }
  };

  const availableToAdd = masterProducts.filter(
    mp => !products.find(op => op.productId === mp.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans md:p-10">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <button 
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Outlet Products</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Manage catalog availability for this location
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> Create Product
          </button>
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
                            {/* Uses the Map (which now has safe strings) */}
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
                            onClick={() => handleDelete(item.productId)}
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
                      // SAFE NAME RENDER HERE
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

    </div>
  );
}