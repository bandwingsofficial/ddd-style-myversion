"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Package, 
  Home, 
  Loader2, 
  AlertCircle, 
  Truck, 
  XCircle, 
  ChevronLeft,
  UtensilsCrossed // Added for "Preparing" icon
} from "lucide-react";
import Header from "@/components/customer/Header";

// ✅ 1. Define Types Locally
interface OrderDetails {
  id: string;
  customerId: string;
  outletId: string;
  cartId: string;
  status: string; 
  address: {
    id: string;
    label: string;
    addressText: string;
    latitude: number;
    longitude: number;
  };
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  items: {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  createdAt: string;
}

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // @ts-ignore
      const data = await CheckoutApi.getOrder(orderId as string);
      setOrder(data);
    } catch (error) {
      console.error("Order fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this pending order?")) return;
    
    setProcessing(true);
    try {
      await CheckoutApi.cancelOrder(orderId as string);
      alert("Order cancelled successfully.");
      fetchOrder(); 
    } catch (error) {
      console.error("Cancellation failed", error);
      alert("Could not cancel. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 text-slate-500">
         <AlertCircle size={48} className="text-slate-300" />
         <p className="font-medium">Order details not found.</p>
         <Link href="/orders" className="text-emerald-600 font-bold hover:underline">Back to Orders</Link>
      </div>
    );
  }

  // ✅ 3. FIXED STATUS LOGIC
  const statusUpper = order.status ? order.status.toUpperCase() : "PENDING";
  
  // Explicit Checks
  const isDelivered = statusUpper === "DELIVERED" || statusUpper === "COMPLETED";
  const isPreparing = statusUpper === "PREPARING" || statusUpper === "ACCEPTED" || statusUpper === "Kitchen";
  const isReady = statusUpper === "READY" || statusUpper === "OUT_FOR_DELIVERY";
  const isPaid = statusUpper === "PAID" || statusUpper === "CONFIRMED";
  const isFailed = statusUpper === "FAILED";
  const isCancelled = statusUpper === "CANCELLED";
  
  // If none of the above, it defaults to Pending
  const isPending = !isDelivered && !isPreparing && !isReady && !isPaid && !isFailed && !isCancelled;

  // ✅ 4. Updated Dynamic Banner Styles
  let bannerStyles = "bg-amber-500 text-white shadow-amber-500/20";
  let BannerIcon = Clock;
  let bannerTitle = "Order Pending";
  let bannerDesc = "We are waiting for payment confirmation.";

  if (isDelivered) {
    bannerStyles = "bg-emerald-600 text-white shadow-emerald-600/20";
    BannerIcon = CheckCircle;
    bannerTitle = "Delivered";
    bannerDesc = "This order has been delivered. Enjoy!";
  } 
  else if (isReady) {
    bannerStyles = "bg-teal-600 text-white shadow-teal-600/20";
    BannerIcon = Truck; // or Bike
    bannerTitle = "Out for Delivery";
    bannerDesc = "Your order is on the way!";
  }
  else if (isPreparing) {
    // ✅ NEW: Specific style for PREPARING
    bannerStyles = "bg-blue-600 text-white shadow-blue-600/20";
    BannerIcon = UtensilsCrossed;
    bannerTitle = "Preparing Order";
    bannerDesc = "The kitchen is preparing your delicious food.";
  } 
  else if (isPaid) {
    bannerStyles = "bg-emerald-500 text-white shadow-emerald-500/20";
    BannerIcon = CheckCircle;
    bannerTitle = "Order Confirmed";
    bannerDesc = "Payment received. Order sent to kitchen.";
  } 
  else if (isFailed) {
    bannerStyles = "bg-red-500 text-white shadow-red-500/20";
    BannerIcon = XCircle;
    bannerTitle = "Payment Failed";
    bannerDesc = "The payment could not be processed.";
  } 
  else if (isCancelled) {
    bannerStyles = "bg-slate-500 text-white shadow-slate-500/20";
    BannerIcon = XCircle;
    bannerTitle = "Order Cancelled";
    bannerDesc = "This order has been cancelled.";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link href="/orders" className="inline-flex items-center text-slate-500 hover:text-emerald-600 mb-6 font-medium transition-colors">
          <ChevronLeft size={20} className="mr-1" /> Back to Orders
        </Link>

        {/* ✅ Status Banner */}
        <div className={`rounded-3xl p-8 mb-8 text-center shadow-lg transition-all ${bannerStyles}`}>
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <BannerIcon size={32} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{bannerTitle}</h1>
          <p className="opacity-90 text-lg mb-2">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="opacity-80 text-sm">{bannerDesc}</p>

          {/* Cancel Button (Only if Pending) */}
          {isPending && (
             <div className="mt-8 pt-6 border-t border-white/20">
                 <button 
                   onClick={handleCancelOrder}
                   disabled={processing}
                   className="bg-white text-amber-600 px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-amber-50 transition-all flex items-center gap-2 mx-auto text-sm disabled:opacity-70"
                 >
                    {processing ? <Loader2 className="animate-spin" size={16}/> : <XCircle size={16}/>}
                    {processing ? "Cancelling..." : "Cancel Order"}
                 </button>
                 <p className="text-white/60 text-xs mt-2">Cancel to retry payment or change items.</p>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Items List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={20} className="text-emerald-600"/> Order Items
              </h2>
              <div className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <div key={item.id || item.productId} className="py-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                       <img 
                        src={getImageUrl(item.productImage) || "/placeholder.png"} 
                        alt={item.productName}
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-sm">{item.productName}</span>
                        <span className="font-bold text-slate-900 text-sm">₹{item.totalPrice}</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">
                        {item.quantity} x ₹{item.unitPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-600"/> Delivery Location
              </h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                <MapPin size={20} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 text-sm mb-1">{order.address.label}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{order.address.addressText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-32">
              <h2 className="font-bold text-slate-800 mb-4">Payment Summary</h2>
              
              <div className="space-y-3 text-sm border-b border-slate-100 pb-4 mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span> 
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                   <div className="flex justify-between text-emerald-600 font-medium">
                     <span>Discount</span> 
                     <span>- ₹{order.discount}</span>
                   </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span> 
                  <span className={order.deliveryFee === 0 ? "text-emerald-600" : ""}>
                    {order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between font-extrabold text-xl text-slate-900 mb-1">
                <span>Total</span>
                <span>₹{order.grandTotal}</span>
              </div>
              <p className="text-xs text-right text-slate-400 font-medium mb-6">Inclusive of all taxes</p>

              <Link href="/home" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">
                <Home size={18} /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}