"use client";

import { useParams } from "next/navigation";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { 
  ShoppingBag, ShieldCheck, Truck, Star, Heart, 
  Minus, Plus, Share2, Leaf, ChevronRight, Loader2, MapPinOff 
} from "lucide-react";
import { useState, useMemo } from "react";
import { ProductDetails } from "@/features/products/types/product.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useFavorites } from "@/providers/CustomerAuthProvider";

const BACKEND_URL = "https://api.dev.local:4000";

export default function ProductDetailsPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const productData = useProductBySlug(routeSlug) as any;
  
  // --- STORES & HOOKS ---
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const currentOutlet = useOutletStore((state) => state.selectedOutlet);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  // --- LOCAL UI STATE ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- DATA NORMALIZATION (Matching ProductCard Logic) ---
  const product = useMemo(() => {
    if (!productData) return null;
    
    const p = productData;
    
    // Normalize Name
    const name = p.name?.value || p.name || "Unknown Product";
    
    // Normalize Price
    const parse = (val: any) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };
    let original = parse(p.originalPrice ?? p.price?.originalPrice ?? p.price?.value ?? p.price);
    let discountVal = parse(p.discountPrice ?? p.salePrice ?? p.price?.discountPrice ?? p.price?.salePrice);
    let current = (discountVal > 0 && discountVal < original) ? discountVal : original;
    
    // Normalize Images
    const rawImage = p.images || p.image || p.mainImage;
    let mainImgPath = "";
    let gallery: string[] = [];

    if (Array.isArray(rawImage)) {
      mainImgPath = rawImage[0] || "";
      gallery = rawImage;
    } else if (typeof rawImage === "object" && rawImage !== null) {
      mainImgPath = rawImage.mainImage || rawImage.url || "";
      gallery = rawImage.galleryImages || [];
    } else if (typeof rawImage === "string") {
      mainImgPath = rawImage;
    }

    const formatUrl = (path: string) => {
      if (!path || path.trim() === "") return "/placeholder.jpg";
      if (path.startsWith("http")) return path;
      return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
    };

    // Normalize Unit
    let unitLabel = "";
    if (typeof p.unit === "object" && p.unit !== null) unitLabel = `${p.unit.value} ${p.unit.type}`;
    else if (p.unit) unitLabel = String(p.unit);

    return {
      ...p,
      displayName: name,
      currentPrice: current,
      originalPrice: original,
      savings: original - current,
      percent: original > 0 ? Math.round(((original - current) / original) * 100) : 0,
      mainImage: formatUrl(mainImgPath),
      gallery: gallery.map(formatUrl),
      unitLabel,
      outletId: currentOutlet?.id || p.outletId
    };
  }, [productData, currentOutlet]);

  // --- DERIVED CART STATE ---
  const cartItem = useMemo(() => items.find((i) => i.productId === product?.id), [items, product?.id]);
  const quantityInCart = cartItem?.quantity || 0;
  const isFav = product ? isFavorite(product.id) : false;

  // --- ACTIONS ---
  const handleAddToCart = async () => {
    if (!currentOutlet) {
      alert("Please select a nearby outlet first.");
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

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-emerald-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-semibold">Squeezing the details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <span className="hover:text-emerald-700 cursor-pointer transition-colors">Home</span> 
            <ChevronRight size={14} />
            <span className="text-emerald-700 font-semibold">{product?.displayName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
            
            {/* LEFT COLUMN: GALLERY */}
            <div className="lg:sticky lg:top-32 space-y-4">
              <div className="relative w-full aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center group">
                <img 
                  src={activeImageUrl} 
                  alt={product?.displayName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product?.trendState?.trending && (
                    <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      Trending
                    </span>
                  )}
                  {product && product.percent > 0 && (
                    <span className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      -{product.percent}% OFF
                    </span>
                  )}
                </div>
                
                <button 
                  className={`absolute top-4 right-4 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 transition-all hover:scale-110 ${isFav ? 'bg-rose-50 border-rose-200' : ''}`}
                  onClick={() => isFav ? removeFromFavorites(product!.id) : addToFavorites(product!)}
                >
                  <Heart size={20} className={`transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                </button>
              </div>

              {/* Thumbnails Strip */}
              {product && product.gallery.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {[product.mainImage, ...product.gallery].map((img, idx) => (
                    <button 
                      key={idx} 
                      className={`relative w-[70px] h-[70px] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageUrl === img ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-transparent hover:border-slate-300'}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DETAILS */}
            <div className="flex flex-col h-full pt-2">
               <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                    {product?.displayName}
                  </h1>
                  <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0 ml-4">
                    <Share2 size={20} />
                  </button>
               </div>

               <div className="flex flex-wrap items-center gap-3 mb-8">
                  {product?.rating && (
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
                        <Star size={14} className="fill-amber-500 text-amber-500" /> 
                        <span>{product.rating.average || "New"}</span>
                        <span className="text-amber-600/70 font-medium">({product.rating.count || 0} reviews)</span>
                      </div>
                  )}
                  {product?.unitLabel && (
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-sm font-semibold">
                        {product.unitLabel}
                      </span>
                  )}
               </div>

               <div className="mb-8 pb-8 border-b border-slate-100">
                  <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-4xl font-extrabold text-emerald-600">₹{product?.currentPrice}</span>
                      {product && product.savings > 0 && (
                        <>
                          <span className="text-lg text-slate-400 line-through font-medium">₹{product.originalPrice}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">
                            Save ₹{product.savings}
                          </span>
                        </>
                      )}
                  </div>
                  <span className="text-xs font-medium text-slate-400">Inclusive of all taxes</span>
               </div>

               <p className="text-lg text-slate-600 leading-relaxed mb-8">
                 {product?.shortDescription}
               </p>

               {/* Add to Cart Actions */}
               <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  {quantityInCart > 0 ? (
                    <div className="flex items-center justify-between bg-emerald-600 rounded-xl p-1 w-full sm:w-[160px] h-[54px] shadow-lg shadow-emerald-600/20">
                      <button 
                        onClick={() => handleUpdateQty(-1)}
                        className="w-11 h-full bg-white/10 rounded-lg text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Minus size={20} strokeWidth={2.5}/>
                      </button>
                      <span className="text-xl font-bold text-white tabular-nums">{quantityInCart}</span>
                      <button 
                        onClick={() => handleUpdateQty(1)}
                        className="w-11 h-full bg-white/10 rounded-lg text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Plus size={20} strokeWidth={2.5}/>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddToCart}
                      disabled={!currentOutlet}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white h-[54px] rounded-xl text-base font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                    >
                      {!currentOutlet ? <MapPinOff size={20} /> : <ShoppingBag size={20} />}
                      {!currentOutlet ? "Select Outlet to Order" : `Add to Order • ₹${product?.currentPrice}`}
                    </button>
                  )}
               </div>

               {/* Features Grid */}
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                  <FeatureBox icon={<Leaf size={20} className="text-emerald-700"/>} bg="bg-emerald-50" title="100% Natural" subtitle="Farm fresh" />
                  <FeatureBox icon={<Truck size={20} className="text-blue-700"/>} bg="bg-blue-50" title="Fast Delivery" subtitle="30-45 mins" />
                  <FeatureBox icon={<ShieldCheck size={20} className="text-purple-700"/>} bg="bg-purple-50" title="Hygienic" subtitle="Safety checks" />
               </div>

               {/* Long Description */}
               {product?.longDescription && (
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h3 className="text-base font-bold text-slate-900 mb-3">About this item</h3>
                      <p className="text-slate-600 leading-relaxed text-[15px]">
                        {product.longDescription}
                      </p>
                   </div>
               )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureBox({ icon, bg, title, subtitle }: { icon: any, bg: string, title: string, subtitle: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <strong className="text-xs font-bold text-slate-900">{title}</strong>
        <span className="text-[10px] text-slate-500 font-medium">{subtitle}</span>
      </div>
    </div>
  );
}