"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Crosshair } from "lucide-react";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { forwardGeocode, reverseGeocode } from "@/features/location/utils/reverseGeocode";
import { AddressService } from "@/features/addresses/address.service";
import Header from "@/components/customer/Header"; // ✅ Added Header
import Footer from "@/components/customer/Footer"; // ✅ Added Footer

export default function AddAddressPage() {
  const router = useRouter();
  const { lat, lng } = useLiveLocation();
  
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const [formData, setFormData] = useState({
    label: "Home",
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    latitude: 0,
    longitude: 0,
  });

  const [details, setDetails] = useState({
    houseNo: "", area: "", landmark: "", pincode: ""
  });

  const handleUseCurrent = async () => {
    if (!lat || !lng) return alert("Location unavailable. Please allow permissions.");
    setDetecting(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      if (addr) {
        const parts = addr.split(",");
        const pin = addr.match(/\d{6}/)?.[0] || "";
        const area = addr.replace(pin, "").replace(/,\s*$/, "").trim();
        setDetails(prev => ({ ...prev, area: area, pincode: pin }));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!details.houseNo || !details.area || !details.pincode) return alert("Please fill all required fields");

    setSubmitting(true);

    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (finalLat === 0) {
      const coords = await forwardGeocode(`${details.area} ${details.pincode}`);
      if (coords) { finalLat = coords.lat; finalLng = coords.lng; }
    }

    try {
      await AddressService.create({
        ...formData,
        latitude: finalLat,
        longitude: finalLng,
        addressText: `${details.houseNo}, ${details.landmark ? details.landmark + ', ' : ''}${details.area} - ${details.pincode}`
      });
      router.push("/profile/addresses");
    } catch (err) {
      console.error(err);
      alert("Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Content (Padding matches MenuPage: pt-[110px] md:pt-[140px]) */}
      <main className="pb-[60px] pt-[110px] md:pt-[140px] bg-slate-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4">
          
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-semibold transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Add New Address</h1>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            
            <div className="grid grid-cols-3 gap-3">
              {["HOME", "WORK", "OTHER"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t as any, label: t === "OTHER" ? "" : t.charAt(0)+t.slice(1).toLowerCase() })}
                  className={`py-3 rounded-xl font-bold border transition-all ${formData.type === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input 
              type="text" 
              value={formData.label} 
              onChange={e => setFormData({...formData, label: e.target.value})}
              placeholder="Label Name (e.g. My Flat)"
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-emerald-500 transition-all"
              required
            />

            <button 
              type="button"
              onClick={handleUseCurrent}
              disabled={detecting}
              className="w-full py-4 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {detecting ? <Loader2 className="animate-spin" /> : <Crosshair />} Use Current Location
            </button>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input value={details.houseNo} onChange={e => setDetails({...details, houseNo: e.target.value})} placeholder="House / Flat No *" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-emerald-500 transition-all" required />
                 <input value={details.pincode} onChange={e => setDetails({...details, pincode: e.target.value})} placeholder="Pincode *" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-emerald-500 transition-all" required />
               </div>
               <textarea value={details.area} onChange={e => setDetails({...details, area: e.target.value})} placeholder="Area / Street / Colony *" className="w-full p-4 rounded-xl border border-slate-200 h-24 resize-none focus:outline-emerald-500 transition-all" required />
               <input value={details.landmark} onChange={e => setDetails({...details, landmark: e.target.value})} placeholder="Landmark (Optional)" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-emerald-500 transition-all" />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}