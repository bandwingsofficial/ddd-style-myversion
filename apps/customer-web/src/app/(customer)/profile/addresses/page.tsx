"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Home, Briefcase, MapPin, Trash2, ArrowLeft, Pencil, AlertCircle, CheckCircle } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

// ✅ 1. Popup Interface
interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

export default function AddressListPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ 2. Popup State
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
    // ✅ 3. Replaced window.confirm with Custom Popup
    setPopup({
      type: "confirm",
      message: "Are you sure you want to delete this address?",
      onConfirm: async () => {
        try {
          setPopup(null); // Close popup immediately
          await AddressService.delete(id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
          setPopup({ type: "error", message: "Failed to delete address" });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ✅ 4. Popup Overlay (Matches your Design) */}
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
                  <button 
                    onClick={() => setPopup(null)} 
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={popup.onConfirm} 
                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setPopup(null)} 
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pb-[60px] pt-[110px] md:pt-[140px] bg-slate-50 min-h-screen">
        <section className="mx-auto max-w-xl px-4">
          
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">My Addresses</h1>
          </div>

          <Link 
            href="/profile/addresses/add" 
            className="flex items-center justify-center gap-2 w-full p-5 mb-6 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-emerald-700 font-bold hover:bg-emerald-50 transition-all"
          >
            <Plus size={20} /> Add New Address
          </Link>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100 p-8">
                <p>No saved addresses found.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md group">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-500">
                    {addr.type === "HOME" ? <Home size={24}/> : addr.type === "WORK" ? <Briefcase size={24}/> : <MapPin size={24}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{addr.label}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase mt-1 inline-block">{addr.type}</span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Link 
                          href={`/profile/addresses/edit/${addr.id}`}
                          className="text-slate-400 hover:text-emerald-600 p-2 transition-colors rounded-lg hover:bg-emerald-50"
                          title="Edit Address"
                        >
                            <Pencil size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(addr.id)} 
                          className="text-slate-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete Address"
                        >
                            <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{addr.addressText}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}