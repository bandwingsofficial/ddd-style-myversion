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
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
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
import { CheckoutPaymentBar } from "@/components/checkout/CheckoutPaymentBar";

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />
      
      <main className="customer-page-shell customer-page-shell--checkout-bar flex-grow">
        <section className="mobile-container max-w-6xl">
          
          {/* ✅ 1. Professional Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight animate-shine">My Cart</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    {items.length === 0 ? "Your cart is empty" : `You have ${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
                </p>
            </div>
            {items.length > 0 && (
                <Link href="/menu" className="hidden md:flex items-center text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-full">
                    <ArrowLeft size={18} className="mr-2" /> Continue Shopping
                </Link>
            )}
          </div>

          {/* Cart Content Logic */}
          {items.length === 0 ? (
            
            /* ✅ 2. Empty State Component (Fixes "nothing is shown") */
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <PackageX size={48} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart feels a bit light</h2>
                <p className="text-slate-500 max-w-md mb-8 px-4">
                    There is nothing in your bag. Let's add some fresh juices and tender coconut to make you happy!
                </p>
                <Link href="/menu" className="bg-emerald-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    Start Shopping
                </Link>
            </div>

          ) : (

            /* ✅ 3. Existing Grid (Enhanced Container) */
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

                   <p className="hidden text-xs text-center text-slate-400 lg:block">
                       Safe & Secure Payment
                   </p>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      <CheckoutPaymentBar
        grandTotal={items.length > 0 ? grandTotal : null}
        onPay={handleCheckoutClick}
        disabled={items.length === 0 || isNoOutlet || !selectedOutlet}
        showSpinner={!hydrated}
        checkoutOpen={false}
        blockReason={
          (isNoOutlet || !selectedOutlet) && items.length > 0
            ? "Choose a delivery location we serve to continue checkout."
            : undefined
        }
        actionLabel="Proceed to Checkout"
        preparingLabel="Loading cart..."
      />
      
      <AddressSelectionModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSelect={handleAddressSelect} 
      />
      
      <Footer />
    </div>
  );
}