"use client";

import { useParams } from "next/navigation";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { 
  ShoppingBag, ShieldCheck, Truck, Star, Heart, 
  Minus, Plus, Leaf, ChevronRight, Loader2, MapPinOff 
} from "lucide-react";
import { useState, useMemo } from "react";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { resolveProductPricing } from "@/lib/product-pricing";
import { toast } from "sonner";

export default function ProductDetailsPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const { product: productData, loading: productLoading, error: productError } =
    useProductBySlug(routeSlug);
  
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const currentOutlet = useOutletStore((state) => state.selectedOutlet);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const product = useMemo(() => {
    if (!productData) return null;

    const p = productData as any;
    const name = p.name?.value || p.name || "Unknown Product";
    const pricing = resolveProductPricing(p);
    
    const mainImgPath = p.images?.mainImageUrl || "";
    const gallery: string[] = p.images?.galleryImageUrls || [];

    let unitLabel = "";
    if (typeof p.unit === "object" && p.unit !== null) unitLabel = `${p.unit.value} ${p.unit.type}`;
    else if (p.unit) unitLabel = String(p.unit);

    return {
      ...p,
      displayName: name,
      currentPrice: pricing.sellingPrice,
      originalPrice: pricing.mrp,
      savings: pricing.savings,
      percent: pricing.discountPercent,
      hasDiscount: pricing.hasDiscount,
      mainImage: mainImgPath || "/placeholder.jpg",
      gallery: gallery.length > 0 ? gallery : (mainImgPath ? [mainImgPath] : []),
      unitLabel,
      outletId: currentOutlet?.id || p.outletId
    };
  }, [productData, currentOutlet]);

  const cartItem = useMemo(() => items.find((i) => i.productId === product?.id), [items, product?.id]);
  const quantityInCart = cartItem?.quantity || 0;
  const isFav = product ? isFavorite(product.id) : false;

  const handleAddToCart = async () => {
    if (!currentOutlet) {
      toast.error("Please select a nearby outlet first.");
      return;
    }
    if (!product || product.originalPrice <= 0) return;

    await addItem({
      productId: product.id,
      outletId: product.outletId,
      productName: product.displayName,
      productImage: product.mainImage,
      quantity: 1,
      unitPrice: product.originalPrice,
      discountPrice: product.currentPrice
    }, isAuthenticated);
  };

  const handleUpdateQty = async (delta: number) => {
    if (!product || !cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) await removeItem(product.id, isAuthenticated);
    else await updateItem(product.id, newQty, isAuthenticated);
  };

  const activeImageUrl = selectedImage || product?.mainImage || "/placeholder.jpg";

  if (productLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="customer-page-shell flex flex-grow flex-col items-center justify-center text-emerald-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-semibold">Squeezing the details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (productError || !productData) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="customer-page-shell flex flex-grow flex-col items-center justify-center px-4 text-center">
          <p className="font-semibold text-slate-800">{productError ?? "Product not found."}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />

      <main className="customer-page-shell customer-page-shell--with-cart flex-grow pb-28 lg:pb-12">
        <div className="mobile-container max-w-6xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-5 overflow-x-auto whitespace-nowrap">
            <span className="hover:text-emerald-700 cursor-pointer transition-colors">Home</span> 
            <ChevronRight size={12} />
            <span className="text-emerald-700 font-semibold">{product?.displayName}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: GALLERY */}
            <div className="space-y-3">
              <div className="relative w-full aspect-[4/3] sm:aspect-square max-h-[400px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center group mx-auto">
                <img 
                  src={activeImageUrl} 
                  alt={product?.displayName} 
                  className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product?.trendState?.trending && (
                    <span className="bg-emerald-600 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      Trending
                    </span>
                  )}
                  {product && product.percent > 0 && (
                    <span className="bg-rose-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      -{product.percent}% OFF
                    </span>
                  )}
                </div>
                
                <button 
                  className={`absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 transition-all hover:scale-110 ${isFav ? 'bg-rose-50 border-rose-200' : ''}`}
                  onClick={() => isFav ? removeFromFavorites(product!.id) : addToFavorites(product!)}
                >
                  <Heart size={18} className={`transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                </button>
              </div>

              {product && product.gallery.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[product.mainImage, ...product.gallery].map((img, idx) => (
                    <button 
                      key={idx} 
                      className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImageUrl === img ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DETAILS */}
            <div className="flex flex-col">
               <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                 {product?.displayName}
               </h1>

               <div className="flex flex-wrap items-center gap-2 mb-4">
                  {product?.rating && (
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-100">
                        <Star size={12} className="fill-amber-500 text-amber-500" /> 
                        <span>{product.rating.average || "New"}</span>
                        <span className="text-amber-600/70 font-medium ml-1">({product.rating.count || 0})</span>
                      </div>
                  )}
                  {product?.unitLabel && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {product.unitLabel}
                      </span>
                  )}
               </div>

               <div className="mb-5 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-600">₹{product?.currentPrice}</span>
                      {product && product.savings > 0 && (
                        <>
                          <span className="text-base text-slate-400 line-through font-medium">₹{product.originalPrice}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Save ₹{product.savings}
                          </span>
                        </>
                      )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">MRP Inclusive of all taxes</span>
               </div>

               <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                 {product?.shortDescription}
               </p>

               {/* Add to Cart Actions - desktop inline */}
               <div className="mb-8 hidden w-full justify-center md:flex">
                  {quantityInCart > 0 ? (
                    <div className="flex items-center justify-between bg-emerald-600 rounded-xl p-1 w-full max-w-[160px] h-[48px] shadow-md">
                      <button 
                        onClick={() => handleUpdateQty(-1)}
                        className="w-10 h-full bg-white/10 rounded-lg text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Minus size={16} strokeWidth={2.5}/>
                      </button>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-base font-bold text-white leading-none">{quantityInCart}</span>
                        <span className="text-[9px] text-emerald-100 font-medium">in cart</span>
                      </div>
                      <button 
                        onClick={() => handleUpdateQty(1)}
                        className="w-10 h-full bg-white/10 rounded-lg text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} strokeWidth={2.5}/>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddToCart}
                      disabled={!currentOutlet}
                      className="w-full max-w-[320px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white h-[48px] rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                    >
                      {!currentOutlet ? <MapPinOff size={18} /> : <ShoppingBag size={18} />}
                      {!currentOutlet ? "Select Outlet to Order" : `Add to Order • ₹${product?.currentPrice}`}
                    </button>
                  )}
               </div>

               {/* Features Grid */}
               <div className="grid grid-cols-3 gap-2 mb-8">
                  <FeatureBox icon={<Leaf size={16} className="text-emerald-700"/>} bg="bg-emerald-50" title="100% Natural" subtitle="Farm fresh" />
                  <FeatureBox icon={<Truck size={16} className="text-blue-700"/>} bg="bg-blue-50" title="Fast Delivery" subtitle="30-45 mins" />
                  <FeatureBox icon={<ShieldCheck size={16} className="text-purple-700"/>} bg="bg-purple-50" title="Hygienic" subtitle="Safe" />
               </div>

               {/* About Item */}
               {product?.longDescription && (
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">About this item</h3>
                      <p className="text-slate-600 leading-snug text-xs">
                        {product.longDescription}
                      </p>
                   </div>
               )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky add-to-cart bar */}
      <div
        className="fixed inset-x-0 z-[800] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-lg md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-500">Total</p>
            <p className="text-lg font-extrabold text-emerald-600">₹{product?.currentPrice}</p>
          </div>
          {quantityInCart > 0 ? (
            <div className="flex h-12 flex-1 max-w-[180px] items-center justify-between rounded-xl bg-emerald-600 p-1 shadow-md">
              <button
                onClick={() => handleUpdateQty(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white touch-target"
                aria-label="Decrease quantity"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <span className="text-base font-bold text-white">{quantityInCart}</span>
              <button
                onClick={() => handleUpdateQty(1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white touch-target"
                aria-label="Increase quantity"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!currentOutlet}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:bg-slate-300 touch-target"
            >
              {!currentOutlet ? <MapPinOff size={18} /> : <ShoppingBag size={18} />}
              {!currentOutlet ? "Select Outlet" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FeatureBox({ icon, bg, title, subtitle }: { icon: any, bg: string, title: string, subtitle: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <strong className="text-[10px] font-bold text-slate-900 truncate">{title}</strong>
        <span className="text-[9px] text-slate-500 font-medium truncate">{subtitle}</span>
      </div>
    </div>
  );
}