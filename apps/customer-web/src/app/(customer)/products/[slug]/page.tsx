"use client";

import { useParams } from "next/navigation";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { 
  ShoppingBag, ShieldCheck, Truck, Star, Heart, 
  Minus, Plus, Share2, Leaf, ChevronRight, Loader2 
} from "lucide-react";
import { useState } from "react";
import { ProductListItem } from "@/features/products/types/product.types"

// --- CONFIG ---
const BACKEND_URL = "https://api.dev.local:4000";

const getImageUrl = (data: any) => {
  if (!data) return "/placeholder.jpg"; 
  let path = "";
  if (typeof data === 'string') path = data;
  else if (typeof data === 'object') path = data.mainImage || data.url || (Array.isArray(data) ? data[0] : "");
  
  if (!path || path.trim() === "") return "/placeholder.jpg";
  if (path.startsWith("http") || path.startsWith("https")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- DERIVED STATE ---
  const activeImageUrl = product ? (selectedImage || getImageUrl(product.images)) : "";
  const originalPrice = product?.price?.originalPrice || 0;
  const discountPrice = product?.price?.discountPrice;
  const currentPrice = (discountPrice && discountPrice < originalPrice) ? discountPrice : originalPrice;
  const savings = originalPrice - currentPrice;
  const percentageOff = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        {!product ? (
          // --- LOADING STATE ---
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-emerald-600 font-semibold">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p>Squeezing the details...</p>
          </div>
        ) : (
          // --- PRODUCT CONTENT ---
          <div className="max-w-7xl mx-auto">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8 overflow-x-auto whitespace-nowrap pb-2">
              <span className="hover:text-emerald-700 cursor-pointer transition-colors">Home</span> 
              <ChevronRight size={14} />
              <span className="hover:text-emerald-700 cursor-pointer transition-colors">Menu</span> 
              <ChevronRight size={14} />
              <span className="text-emerald-700 font-semibold">{product.name.value}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
              
              {/* --- LEFT COLUMN: GALLERY --- */}
              <div className="lg:sticky lg:top-32 space-y-4">
                <div className="relative w-full aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center group">
                   <img 
                     src={activeImageUrl} 
                     alt={product.name.value} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                   />
                   
                   {/* Floating Badges */}
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                     {product.trendState?.trending && (
                       <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                         Trending
                       </span>
                     )}
                     {percentageOff > 0 && (
                       <span className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                         -{percentageOff}% OFF
                       </span>
                     )}
                   </div>
                   
                   <button 
                     className={`absolute top-4 right-4 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 transition-all hover:scale-110 active:scale-95 ${isWishlisted ? 'bg-rose-50 border-rose-200' : ''}`}
                     onClick={() => setIsWishlisted(!isWishlisted)}
                   >
                      <Heart 
                        size={20} 
                        className={`transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} 
                      />
                   </button>
                </div>

                {/* Thumbnails Strip */}
                {product.images?.galleryImages?.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {[getImageUrl(product.images), ...product.images.galleryImages.map((i:any) => getImageUrl(i))].map((img, idx) => (
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

              {/* --- RIGHT COLUMN: DETAILS --- */}
              <div className="flex flex-col h-full pt-2">
                 
                 <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                      {product.name.value}
                    </h1>
                    <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0 ml-4">
                      <Share2 size={20} />
                    </button>
                 </div>

                 {/* Ratings & Meta */}
                 <div className="flex flex-wrap items-center gap-3 mb-8">
                    {product.rating && (
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
                          <Star size={14} className="fill-amber-500 text-amber-500" /> 
                          <span>{product.rating.average || "New"}</span>
                          <span className="text-amber-600/70 font-medium">({product.rating.count || 0} reviews)</span>
                        </div>
                    )}
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    {product.unit && (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-sm font-semibold">
                          {product.unit.value} {product.unit.type}
                        </span>
                    )}
                 </div>

                 {/* Price Block */}
                 <div className="mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-baseline gap-3 mb-1">
                       <span className="text-4xl font-extrabold text-emerald-600">₹{currentPrice}</span>
                       {percentageOff > 0 && (
                         <>
                           <span className="text-lg text-slate-400 line-through font-medium">₹{originalPrice}</span>
                           <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">
                             Save ₹{savings}
                           </span>
                         </>
                       )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">Inclusive of all taxes</span>
                 </div>

                 <p className="text-lg text-slate-600 leading-relaxed mb-8">
                   {product.shortDescription}
                 </p>

                 {/* Add to Cart Actions */}
                 <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 w-full sm:w-[140px] h-[54px]">
                       <button 
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         className="w-9 h-full bg-white rounded-lg shadow-sm text-slate-700 hover:text-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50"
                       >
                         <Minus size={16} strokeWidth={2.5}/>
                       </button>
                       <span className="text-lg font-bold text-slate-900 tabular-nums">{quantity}</span>
                       <button 
                         onClick={() => setQuantity(quantity + 1)}
                         className="w-9 h-full bg-white rounded-lg shadow-sm text-slate-700 hover:text-emerald-600 flex items-center justify-center transition-colors"
                       >
                         <Plus size={16} strokeWidth={2.5}/>
                       </button>
                    </div>

                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-[54px] rounded-xl text-base font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                       <ShoppingBag size={20} />
                       Add to Order • ₹{currentPrice * quantity}
                    </button>
                 </div>

                 {/* Features Grid */}
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                    <FeatureBox 
                      icon={<Leaf size={20} className="text-emerald-700"/>} 
                      bg="bg-emerald-50" 
                      title="100% Natural" 
                      subtitle="Farm fresh" 
                    />
                    <FeatureBox 
                      icon={<Truck size={20} className="text-blue-700"/>} 
                      bg="bg-blue-50" 
                      title="Fast Delivery" 
                      subtitle="30-45 mins" 
                    />
                    <FeatureBox 
                      icon={<ShieldCheck size={20} className="text-purple-700"/>} 
                      bg="bg-purple-50" 
                      title="Hygienic" 
                      subtitle="Safety checks" 
                    />
                 </div>

                 {/* Long Description */}
                 {product.longDescription && (
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
        )}
      </main>

      <Footer />
    </div>
  );
}

// Sub-component for Cleaner Code
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