"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  ArrowLeft, 
  PackageX 
} from "lucide-react";
import AddressSelectionModal from "@/components/address/AddressSelectionModal";
import { Address } from "@/features/addresses/address.service";
import { OrderSummaryBreakdown } from "@/features/orders/components/OrderSummaryBreakdown";
import { toast } from "sonner";

import { getProductImageUrl } from "@/lib/image-url";
import { computeLineTotal, resolveEffectivePrice } from "@/lib/cart-pricing";
import { useDeliveryAppState } from "@/features/location/hooks/useDeliveryAppState";
import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { typography } from "@/lib/design-tokens";

export default function CartPage() {
  const router = useRouter();
  const { items, summary, updateItem, removeItem, hydrated, loadCart } = useCartStore();
  const { isLoggedIn } = useCustomerSession();
  const { isNoOutlet, selectedOutlet } = useDeliveryAppState();
  const openLocationSheet = useLocationOrchestratorStore(
    (state) => state.openLocationSheet,
  );
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) void loadCart(isLoggedIn);
  }, [hydrated, isLoggedIn, loadCart]);

  // Calculations come from backend summary (or guest preview API)
  const { subtotal, discount: totalDiscount, netSubtotal, deliveryFee, grandTotal, remainingForFreeDelivery } = summary;

  // Handlers
  const handleQuantityChange = async (productId: string, currentQty: number, delta: number) => {
    if (isUpdating) return;
    const newQty = currentQty + delta;
    setIsUpdating(productId);
    try {
      if (newQty <= 0) await removeItem(productId);
      else await updateItem(productId, newQty);
    } finally { setIsUpdating(null); }
  };

  const handleRemove = async (productId: string) => {
    setIsUpdating(productId);
    await removeItem(productId);
    setIsUpdating(null);
  };

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/cart");
      return;
    }
    if (!selectedOutlet || isNoOutlet) {
      toast.error("Choose a delivery location we serve before checkout.");
      openLocationSheet();
      return;
    }
    setIsAddressModalOpen(true);
  };

  const handleAddressSelect = (address: Address) => {
    setIsAddressModalOpen(false);
    router.push(`/cart/checkout?addressId=${address.id}`);
  };

  if (!hydrated) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" label="Loading your cart..." />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />
      
      <main className="customer-page-shell flex-grow">
        <section className="mobile-container max-w-6xl mt-4 mb-8">
          <Breadcrumbs items={[{ label: "Cart" }]} />

          <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
            <div>
                <h1 className={typography.pageTitle}>My Cart</h1>
                <p className="mt-2 font-medium text-slate-500">
                    {items.length === 0 ? "Your cart is empty" : `You have ${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
                </p>
            </div>
            {items.length > 0 && (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/menu">
                    <ArrowLeft size={18} /> Continue Shopping
                  </Link>
                </Button>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<PackageX size={40} className="text-slate-400" />}
              title="Your cart feels a bit light"
              description="There is nothing in your bag. Let's add some fresh juices and tender coconut to make you happy!"
              primaryAction={{
                label: "Start Shopping",
                onClick: () => router.push("/menu"),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in-up">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                   const imageUrl = getProductImageUrl(item.productImage);
                   const isLoading = isUpdating === item.productId;
                   const effectivePrice = resolveEffectivePrice(
                     item.unitPrice,
                     item.discountPrice,
                   );
                   const lineTotal = computeLineTotal(
                     item.unitPrice,
                     item.discountPrice,
                     item.quantity,
                   );
                   const lineMrp = item.unitPrice * item.quantity;
                   const hasLineDiscount = effectivePrice < item.unitPrice;
                   return (
                     <div key={item.productId} className={`group relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                       
                       {/* Product Image */}
                       <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 relative">
                         {imageUrl ? (
                            <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={24} /></div>
                         )}
                       </div>

                       {/* Product Details */}
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{item.productName}</h3>
                                <p className="text-sm text-slate-500 mt-1">Fresh & Natural</p>
                             </div>
                             <button onClick={() => handleRemove(item.productId)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 size={18} />
                             </button>
                          </div>

                          <div className="flex items-center justify-between mt-4 sm:mt-0">
                             {/* Qty Controls */}
                             <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                               <button 
                                 onClick={() => handleQuantityChange(item.productId, item.quantity, -1)} 
                                 className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-colors hover:text-emerald-600 disabled:opacity-50 touch-target"
                                 disabled={isLoading}
                                 aria-label="Decrease quantity"
                               >
                                 <Minus size={14}/>
                               </button>
                               <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                               <button 
                                 onClick={() => handleQuantityChange(item.productId, item.quantity, 1)} 
                                 className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-colors hover:text-emerald-600 disabled:opacity-50 touch-target"
                                 disabled={isLoading}
                                 aria-label="Increase quantity"
                               >
                                 <Plus size={14}/>
                               </button>
                             </div>
                             
                             <div className="text-right">
                                {hasLineDiscount && (
                                    <span className="block text-xs text-slate-400 line-through">₹{lineMrp}</span>
                                )}
                                <span className="block text-lg font-extrabold text-slate-900">₹{lineTotal}</span>
                             </div>
                          </div>
                       </div>
                     </div>
                   );
                })}
              </div>

              {/* Summary Panel */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:sticky lg:top-36">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                   
                   <div className="mb-6 pb-6 border-b border-slate-100">
                     <OrderSummaryBreakdown
                       subtotal={subtotal}
                       discount={totalDiscount}
                       netSubtotal={netSubtotal}
                       deliveryFee={deliveryFee}
                       grandTotal={grandTotal}
                       remainingForFreeDelivery={remainingForFreeDelivery}
                       totalLabel="Total Payable"
                       className="space-y-3 text-slate-500 text-sm"
                       totalClassName="flex justify-between items-end pt-4 font-bold text-slate-900"
                     />
                   </div>
                   
                   {(isNoOutlet || !selectedOutlet) && items.length > 0 && (
                     <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
                       Choose a delivery location we serve to continue checkout.
                     </p>
                   )}

                   <p className="text-xs text-center text-slate-400">
                     Safe & Secure Payment
                   </p>

                   <button
                     type="button"
                     onClick={handleCheckoutClick}
                     disabled={
                       items.length === 0 ||
                       isNoOutlet ||
                       !selectedOutlet ||
                       !hydrated
                     }
                     className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-base font-bold text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                   >
                     {!hydrated ? "Loading cart..." : "Proceed to Checkout"}
                   </button>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      <AddressSelectionModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSelect={handleAddressSelect} 
      />
      
      <Footer />
    </div>
  );
}