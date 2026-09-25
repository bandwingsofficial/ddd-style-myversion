'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Search, Trash2, Loader2, Store,
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, X, XCircle, ImageOff
} from 'lucide-react';
import { UsersService } from '@/features/users/users.service';
import { OutletProduct } from '@/features/users/users.types';
import { Product } from '@/features/products/types/product.types';
import { Select } from '@/components/ui/select';

const PAGE_SIZE = 20;

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
  const [masterProducts, setMasterProducts] = useState<Product[]>([]); 
  const [outletName, setOutletName] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  
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

  const [masterById, setMasterById] = useState<Record<string, Product>>({});

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
  const getSafeName = (product: { name?: string | { value?: string } }) => {
    if (!product) return 'Unknown Product';
    if (typeof product.name === 'string') return product.name;
    if (typeof product.name === 'object' && product.name?.value) return product.name.value;
    return 'Unnamed Product';
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [outletData, masterData, outletDetails] = await Promise.all([
        UsersService.getOutletProducts(outletId),
        UsersService.getMasterProducts(),
        UsersService.getOutletById(outletId),
      ]);

      const safeOutletProducts = Array.isArray(outletData) ? outletData : [];
      const safeMasterProducts = Array.isArray(masterData) ? masterData : [];

      setProducts(safeOutletProducts);
      setMasterProducts(safeMasterProducts);
      setOutletName(outletDetails?.name || 'Unknown Outlet');

      const map: Record<string, Product> = {};
      safeMasterProducts.forEach((product) => {
        map[product.id] = product;
      });
      setMasterById(map);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setProducts([]);
      setMasterProducts([]);
      setMasterById({});
      setFlashMessage({
        type: 'error',
        title: 'Load Failed',
        text: 'Could not load outlet products. Please try again.',
      });
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
        title: 'Product Unassigned',
        text: 'The product has been unassigned from this outlet.'
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

  const formatUnit = (product?: Product) => {
    if (!product) return '—';
    return `${product.unitValue} ${product.unitType}`;
  };

  const formatPrice = (product?: Product) => {
    if (!product) return '—';
    const original = product.price.originalPrice;
    const discount = product.price.discountPrice;

    if (discount != null && discount > 0 && discount < original) {
      return `₹${discount}`;
    }

    return `₹${original}`;
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((item) => {
      const product = masterById[item.productId];
      const name = product ? getSafeName(product) : '';
      return (
        name.toLowerCase().includes(query) ||
        item.productId.toLowerCase().includes(query)
      );
    });
  }, [products, masterById, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page, totalPages]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const availableToAdd = useMemo(() => {
    if (!Array.isArray(masterProducts)) {
      return [];
    }

    return masterProducts.filter(
      (masterProduct) =>
        !products.find(
          (outletProduct) => outletProduct.productId === masterProduct.id,
        ),
    );
  }, [masterProducts, products]);

  const productSelectOptions = useMemo(
    () =>
      availableToAdd.map((product) => ({
        value: product.id,
        label: getSafeName(product),
      })),
    [availableToAdd],
  );

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-8">
            <button 
              type="button"
              onClick={() => router.push('/users')}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <Store size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {loading ? 'Loading...' : outletName}
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Manage catalog availability for this location
                        </p>
                    </div>
                </div>
              
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                >
                    <Plus size={18} strokeWidth={2.5} /> Assign Product
                </button>
            </div>
        </div>

        {/* LIST TABLE */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="relative max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Image</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Unit</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.map((item) => {
                    const product = masterById[item.productId];
                    const imageUrl = product?.images?.mainImageUrl;

                    return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product ? getSafeName(product) : 'Product'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff size={16} className="text-slate-400" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {product ? getSafeName(product) : 'Unknown Product'}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatUnit(product)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product?.categoryName || '—'}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {formatPrice(product)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          type="button"
                          onClick={() => handleDeleteClick(item.productId)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"
                        >
                          Unassign
                        </button>
                      </td>
                    </motion.tr>
                    );
                  })}
                  {!loading && filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        {search
                          ? 'No products match your search.'
                          : 'No products assigned. Click "Assign Product" to add one.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-xs font-medium text-slate-500">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[7rem] text-center text-xs font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE PRODUCT MODAL --- */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal title="Assign Product" onClose={() => setShowCreateModal(false)}>
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-sm text-slate-600">
                  Select a product from the master list to add to this outlet.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Select Product</label>
                <Select
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  options={productSelectOptions}
                  placeholder="Choose product..."
                  searchable
                  leadingIcon={<Search size={16} />}
                />
              </div>

              <button 
                onClick={handleCreateProduct}
                disabled={!selectedProductId}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                <Plus size={18} strokeWidth={2.5} />
                Assign Product
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {itemToDelete && (
          <Modal title="Confirm Unassign" onClose={() => setItemToDelete(null)}>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3 text-red-500">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <p className="mb-6 text-sm text-slate-600">
                Are you sure you want to unassign this product from this outlet?
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
                  Unassign
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