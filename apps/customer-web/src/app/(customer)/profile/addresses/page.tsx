"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Home, Briefcase, MapPin, Trash2, ArrowLeft } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import Header from "@/components/customer/Header"; // ✅ Added Header
import Footer from "@/components/customer/Footer"; // ✅ Added Footer

export default function AddressListPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this address?")) return;
    try {
      await AddressService.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert("Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Content (Padding matches MenuPage: pt-[110px] md:pt-[140px]) */}
      <main className="pb-[60px] pt-[110px] md:pt-[140px] bg-slate-50 min-h-screen">
        <section className="mx-auto max-w-xl px-4">
          
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.back()} 
              className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">My Addresses</h1>
          </div>

          {/* Add New Button */}
          <Link 
            href="/profile/addresses/add" 
            className="flex items-center justify-center gap-2 w-full p-5 mb-6 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-emerald-700 font-bold hover:bg-emerald-50 transition-all"
          >
            <Plus size={20} /> Add New Address
          </Link>

          {/* Address List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading your addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100 p-8">
                <p>No saved addresses found.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-500">
                    {addr.type === "HOME" ? <Home size={24}/> : addr.type === "WORK" ? <Briefcase size={24}/> : <MapPin size={24}/>}
                  </div>
                  <div className="flex-1 min-w-0"> {/* min-w-0 prevents text overflow issues */}
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{addr.label}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase mt-1 inline-block">{addr.type}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(addr.id)} 
                        className="text-red-400 hover:text-red-600 p-2 -mr-2 transition-colors"
                        title="Delete Address"
                      >
                          <Trash2 size={18}/>
                      </button>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{addr.addressText}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </section>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}