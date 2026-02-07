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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center border border-slate-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${popup.type === 'error' || popup.type === 'confirm' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">
              {popup.type === 'confirm' ? 'Delete Address?' : popup.type === 'error' ? 'Error' : 'Success'}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{popup.message}</p>
            <div className="flex gap-3 justify-center">
              {popup.type === 'confirm' ? (
                <>
                  <button onClick={() => setPopup(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Cancel</button>
                  <button onClick={popup.onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30">Delete</button>
                </>
              ) : (
                <button onClick={() => setPopup(null)} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">Okay</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ MAIN CONTENT STRUCTURE (Dashboard Layout) */}
      <main className="pt-[100px] md:pt-[120px] pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
         {/* ✅ RIGHT CONTENT AREA */}
          <section className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition text-slate-600">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Addresses</h1>
            </div>

            <Link 
              href="/profile/addresses/add" 
              className="flex items-center justify-center gap-2 w-full p-8 mb-6 border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-[2rem] text-emerald-700 font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-emerald-600" />
              </div>
              <span className="text-lg">Add New Address</span>
            </Link>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10 text-slate-400">Loading...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white rounded-[2rem] border border-slate-100 p-8">
                  <p className="font-medium">No saved addresses found.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-5 transition-all hover:shadow-md hover:border-emerald-100 group">
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      {addr.type === "HOME" ? <Home size={28}/> : addr.type === "WORK" ? <Briefcase size={28}/> : <MapPin size={28}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800 text-xl leading-tight mb-1">{addr.label}</h3>
                          <span className="text-[10px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">{addr.type}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link 
                            href={`/profile/addresses/edit/${addr.id}`}
                            className="text-slate-400 hover:text-emerald-600 p-2.5 transition-colors rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100"
                          >
                              <Pencil size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(addr.id)} 
                            className="text-slate-400 hover:text-red-600 p-2.5 transition-colors rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
                          >
                              <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-500 mt-3 leading-relaxed text-sm md:text-base">{addr.addressText}</p>
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
