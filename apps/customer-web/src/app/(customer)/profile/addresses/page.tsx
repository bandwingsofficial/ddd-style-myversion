"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Home, Briefcase, MapPin, Trash2, ArrowLeft, Pencil, AlertCircle, CheckCircle, User, MapPin as MapIcon, ShoppingBag, LogOut } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

// ✅ Popup Interface
interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

export default function AddressListPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await AddressService.getAll();
      setAddresses(data.filter(a => !a.isDeleted));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setPopup({
      type: "confirm",
      message: "Are you sure you want to delete this address?",
      onConfirm: async () => {
        try {
          setPopup(null);
          await AddressService.delete(id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
          setPopup({ type: "error", message: "Failed to delete address" });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* ✅ Popup Overlay */}
      {popup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-1 animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded-xl shadow-2xl max-w-xs w-full text-center border border-slate-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${popup.type === 'error' || popup.type === 'confirm' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <h3 className="font-bold text-slate-800 mb-1 text-base">
              {popup.type === 'confirm' ? 'Delete Address?' : popup.type === 'error' ? 'Error' : 'Success'}
            </h3>
            <p className="text-slate-500 text-xs mb-4 leading-relaxed">{popup.message}</p>
            <div className="flex gap-2 justify-center">
              {popup.type === 'confirm' ? (
                <>
                  <button onClick={() => setPopup(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition text-sm">Cancel</button>
                  <button onClick={popup.onConfirm} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition shadow-md text-sm">Delete</button>
                </>
              ) : (
                <button onClick={() => setPopup(null)} className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition text-sm">Okay</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ MAIN CONTENT STRUCTURE - Added more top padding pt-[140px] */}
      <main className="pt-[40px] pb-10 px-2 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-2">
          
          {/* ✅ RIGHT CONTENT AREA */}
          <section className="flex-1">
            {/* Header with Title and Right-Aligned Button */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <button onClick={() => router.back()} className="p-1.5 bg-white rounded-full shadow-sm hover:bg-slate-100 transition text-slate-600">
                  <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-black text-slate-800 tracking-tight animate-shine">My Addresses</h1>
              </div>

              <Link 
                href="/profile/addresses/add" 
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 text-sm"
              >
                <Plus size={18} />
                <span>Add New Address</span>
              </Link>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-5 text-slate-400 text-sm">Loading...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100 p-4">
                  <p className="font-medium text-sm">No saved addresses found.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3 transition-all hover:shadow-md group">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      {addr.type === "HOME" ? <Home size={20}/> : addr.type === "WORK" ? <Briefcase size={20}/> : <MapPin size={20}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">{addr.label}</h3>
                          <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">{addr.type}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          <Link 
                            href={`/profile/addresses/edit/${addr.id}`}
                            className="text-slate-400 hover:text-emerald-600 p-1.5 transition-colors rounded-lg hover:bg-emerald-50 border border-transparent"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(addr.id)} 
                            className="text-slate-400 hover:text-red-600 p-1.5 transition-colors rounded-lg hover:bg-red-50 border border-transparent"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-500 mt-1 leading-snug text-xs md:text-sm">{addr.addressText}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}