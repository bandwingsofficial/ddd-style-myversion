"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Crosshair, AlertCircle, CheckCircle } from "lucide-react";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { forwardGeocode, reverseGeocode } from "@/features/location/utils/reverseGeocode";
import { AddressService, Address } from "@/features/addresses/address.service";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

// ✅ 1. Popup Interface
interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const addressId = params.id as string;
  
  const { lat, lng } = useLiveLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  
  // ✅ 2. Popup State
  const [popup, setPopup] = useState<PopupState | null>(null);
  
  // Validation Banner State (Kept for inline form validation)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [otherAddresses, setOtherAddresses] = useState<Address[]>([]);

  const [formData, setFormData] = useState({
    label: "",
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    latitude: 0,
    longitude: 0,
  });

  const [details, setDetails] = useState({
    houseNo: "", area: "", landmark: "", pincode: ""
  });

  useEffect(() => {
    async function init() {
      try {
        const data = await AddressService.getAll();
        const active = data.filter(a => !a.isDeleted);
        
        const current = active.find(a => String(a.id) === String(addressId));
        
        if (!current) {
            // ✅ 3. Replaced alert with Popup
            setPopup({
                type: "error",
                message: "Address not found. Returning to list.",
                onConfirm: () => router.push("/profile/addresses")
            });
            return;
        }

        setOtherAddresses(active.filter(a => String(a.id) !== String(addressId)));

        setFormData({
            label: current.label,
            type: current.type,
            latitude: current.latitude,
            longitude: current.longitude
        });

        let rawText = current.addressText || "";
        const pinMatch = rawText.match(/\b\d{6}\b/);
        const pincode = pinMatch ? pinMatch[0] : "";
        let areaPart = rawText.replace(pincode, "").replace(/-\s*$/, "").trim();
        
        let houseNo = "";
        const firstCommaIndex = areaPart.indexOf(",");
        if (firstCommaIndex > -1 && firstCommaIndex < 20) {
             houseNo = areaPart.substring(0, firstCommaIndex).trim();
             areaPart = areaPart.substring(firstCommaIndex + 1).trim();
        }

        setDetails({
            houseNo: houseNo, 
            area: areaPart, 
            landmark: "",
            pincode: pincode
        });

      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load address details.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [addressId, router]);

  const handleUseCurrent = async () => {
    // ✅ 4. Replaced alert with Popup
    if (!lat || !lng) {
        setPopup({ type: "error", message: "Location unavailable. Please check permissions." });
        return;
    }

    setDetecting(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      if (addr) {
        const pin = addr.match(/\d{6}/)?.[0] || "";
        const area = addr.replace(pin, "").replace(/,\s*$/, "").trim();
        setDetails(prev => ({ ...prev, area: area, pincode: pin }));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleTypeSelect = (type: "HOME" | "WORK" | "OTHER") => {
    setFormData({ 
        ...formData, 
        type, 
        label: type === "OTHER" ? "" : type.charAt(0) + type.slice(1).toLowerCase() 
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.type !== "OTHER" && otherAddresses.some(a => a.type === formData.type)) {
        setErrorMsg(`You already have a ${formData.type} address. Please select 'Other' or edit the existing one.`);
        return;
    }

    if(!details.area || !details.pincode) {
        setErrorMsg("Please fill Area and Pincode");
        return;
    }

    setSubmitting(true);

    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (finalLat === 0) {
      const coords = await forwardGeocode(`${details.area} ${details.pincode}`);
      if (coords) { finalLat = coords.lat; finalLng = coords.lng; }
    }

    try {
      const addressText = `${details.houseNo ? details.houseNo + ', ' : ''}${details.landmark ? details.landmark + ', ' : ''}${details.area} - ${details.pincode}`;

      await AddressService.update(addressId, {
        ...formData,
        latitude: finalLat,
        longitude: finalLng,
        addressText
      });
      
      router.push("/profile/addresses");
    } catch (err) {
      // ✅ 5. Use Popup for critical save errors
      setPopup({ type: "error", message: "Failed to update address. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const homeTaken = otherAddresses.some(a => a.type === "HOME");
  const workTaken = otherAddresses.some(a => a.type === "WORK");

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ✅ 6. Popup Overlay */}
      {popup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center border border-slate-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${popup.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            
            <h3 className="font-bold text-slate-800 mb-2 text-lg">
              {popup.type === 'error' ? 'Error' : 'Success'}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{popup.message}</p>
            
            <button 
              onClick={() => {
                  if(popup.onConfirm) popup.onConfirm();
                  setPopup(null);
              }} 
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <main className="pb-[60px] pt-[110px] md:pt-[140px] bg-slate-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4">
          
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-semibold transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Address</h1>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            
            {/* Inline Error Banner for Validation */}
            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} /> {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleTypeSelect("HOME")}
                disabled={homeTaken}
                className={`py-3 rounded-xl font-bold border transition-all relative ${
                    formData.type === "HOME" 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : homeTaken 
                        ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                }`}
              >
                Home {homeTaken && <span className="block text-[8px] font-normal leading-none opacity-80">(Taken)</span>}
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect("WORK")}
                disabled={workTaken}
                className={`py-3 rounded-xl font-bold border transition-all relative ${
                    formData.type === "WORK" 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : workTaken 
                        ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                }`}
              >
                Work {workTaken && <span className="block text-[8px] font-normal leading-none opacity-80">(Taken)</span>}
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect("OTHER")}
                className={`py-3 rounded-xl font-bold border transition-all ${
                    formData.type === "OTHER" 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                }`}
              >
                Other
              </button>
            </div>

            <input 
              type="text" 
              value={formData.label} 
              onChange={e => setFormData({...formData, label: e.target.value})}
              placeholder="Label Name (e.g. My Flat)"
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-emerald-500 transition-all"
              readOnly={formData.type !== "OTHER"}
              required
            />

            <button 
              type="button"
              onClick={handleUseCurrent}
              disabled={detecting}
              className="w-full py-4 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {detecting ? <Loader2 className="animate-spin" /> : <Crosshair />} Update Location from GPS
            </button>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input value={details.houseNo} onChange={e => setDetails({...details, houseNo: e.target.value})} placeholder="House / Flat No" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-emerald-500 transition-all" />
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
              {submitting ? "Updating..." : "Update Address"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}