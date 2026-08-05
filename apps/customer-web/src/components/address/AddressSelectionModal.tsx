"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, MapPin, Plus, Loader2, Home, Briefcase, Pencil, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import { forwardGeocode } from "@/features/location/utils/reverseGeocode";
import { AddressFormMapHero } from "@/features/addresses/components/AddressFormMapHero";
import {
  pickCurrentLocation,
  reverseGeocodeDetailedForPicker,
  type ParsedGeocodedAddress,
} from "@/features/addresses/utils/pick-current-location";
import { useCartStore } from "@/features/cart/cart.store";
import { getEffectiveCartOutletName } from "@/features/cart/cart-outlet.util";
import { useLocationStore } from "@/features/location/location.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { validateAddressForCheckout } from "@/features/checkout/validate-address-outlet.util";
import { applySavedAddressOutlet } from "@/features/location/services/apply-saved-address-outlet.service";
import { mapAddressApiError } from "@/features/addresses/address-error.util";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

interface PopupState {
  type: "error" | "success" | "confirm" | "outlet_mismatch";
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DetailedAddress {
  houseNo: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

const INITIAL_FORM_STATE = {
  label: "Home",
  type: "HOME" as "HOME" | "WORK" | "OTHER",
  addressText: "",
  latitude: 0,
  longitude: 0,
};

export default function AddressSelectionModal({ isOpen, onClose, onSelect }: AddressModalProps) {
  const cartOutletId = useCartStore((state) => state.cartOutletId);
  const clearCart = useCartStore((state) => state.clear);
  const cartOutletName = useCartStore((state) => state.cartOutletName);
  const { isAuthenticated, sessionChecked } = useCustomerAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutlet, setCheckingOutlet] = useState(false);
  
  const [view, setView] = useState<"LIST" | "FORM">("LIST");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [details, setDetails] = useState<DetailedAddress>({
    houseNo: "", area: "", landmark: "", city: "", state: "", pincode: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);

  const [detectingLoc, setDetectingLoc] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [initializingLocation, setInitializingLocation] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<"IDLE" | "SEARCHING" | "FOUND" | "NOT_FOUND">("IDLE");
  const suppressAreaForwardGeocodeRef = useRef(false);
  const locationInitKeyRef = useRef<string | null>(null);

  const resetLocationPreview = () => {
    setShowMapPreview(false);
    setLocationError(null);
    setInitializingLocation(false);
    locationInitKeyRef.current = null;
  };

  useEffect(() => {
    if (!isOpen) return;

    if (!sessionChecked) return;

    if (!isAuthenticated) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    void fetchAddresses();
    setView("LIST");
    setEditingId(null);
    setPopup(null);
    setCheckingOutlet(false);
  }, [isOpen, isAuthenticated, sessionChecked]);

  useEffect(() => {
    if (suppressAreaForwardGeocodeRef.current) return;
    if (view === "FORM" && details.area.length > 5 && !detectingLoc && !showMapPreview && !initializingLocation) {
      const timer = setTimeout(async () => {
        setGeocodingStatus("SEARCHING");
        const coords = await forwardGeocode(details.area);
        
        if (coords) {
          setFormData(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
          setGeocodingStatus("FOUND");
        } else {
          setGeocodingStatus("NOT_FOUND");
        }
      }, 1500); 
      return () => clearTimeout(timer);
    } else {
        setGeocodingStatus("IDLE");
    }
  }, [details.area, view, detectingLoc, showMapPreview, initializingLocation]);

  useEffect(() => {
    if (!isOpen || view !== "FORM") return;

    const initKey = editingId ?? "new";
    if (locationInitKeyRef.current === initKey) return;
    locationInitKeyRef.current = initKey;

    if (editingId && formData.latitude && formData.longitude) {
      setShowMapPreview(true);
      setLocationError(null);
      return;
    }

    void applyGpsLocation(false);
  }, [isOpen, view, editingId]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await AddressService.getAll();
      const activeAddresses = data.filter((a) => !a.isDeleted);
      setAddresses(activeAddresses);
      if (activeAddresses.length === 0) startAddMode(activeAddresses);
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoading(false);
    }
  };

  const getTakenTypes = (currentList: Address[], ignoreId?: string | null) => {
    const others = ignoreId ? currentList.filter((a) => a.id !== ignoreId) : currentList;
    return {
      hasHome: others.some((a) => a.type === "HOME"),
      hasWork: others.some((a) => a.type === "WORK"),
    };
  };

  const startAddMode = (currentList = addresses) => {
    const { hasHome, hasWork } = getTakenTypes(currentList, null);
    let defaultType: "HOME" | "WORK" | "OTHER" = "HOME";
    let defaultLabel = "Home";
    if (hasHome) { defaultType = "WORK"; defaultLabel = "Work"; }
    if (hasHome && hasWork) { defaultType = "OTHER"; defaultLabel = ""; }

    setEditingId(null);
    setFormData({ ...INITIAL_FORM_STATE, type: defaultType, label: defaultLabel });
    setDetails({ houseNo: "", area: "", landmark: "", city: "", state: "", pincode: "" });
    resetLocationPreview();
    setView("FORM");
  };

  const startEditMode = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      type: address.type,
      addressText: address.addressText,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    
    const parts = address.addressText.split("-");
    const lastPart = parts[parts.length - 1]?.trim();
    const isPincode = /^\d{6}$/.test(lastPart);
    
    setDetails({
        houseNo: address.houseNumber ?? "",
        area: address.street ?? (isPincode ? parts.slice(0, -1).join("-").trim() : address.addressText),
        landmark: address.landmark ?? "",
        city: "",
        state: "",
        pincode: address.pincode ?? (isPincode ? lastPart : "")
    });

    setGeocodingStatus("IDLE");
    resetLocationPreview();
    setView("FORM");
  };

  const applyParsedGeocode = (parsed: ParsedGeocodedAddress) => {
    suppressAreaForwardGeocodeRef.current = true;
    setDetails((prev) => ({
      houseNo: parsed.houseNumber || prev.houseNo,
      area: parsed.street || parsed.area || prev.area,
      landmark: parsed.landmark || prev.landmark,
      city: parsed.city || prev.city,
      state: parsed.state || prev.state,
      pincode: parsed.pincode || prev.pincode,
    }));
    window.setTimeout(() => {
      suppressAreaForwardGeocodeRef.current = false;
    }, 2000);
  };

  const applyGpsLocation = async (forceRecenter: boolean) => {
    if (forceRecenter) {
      locationInitKeyRef.current = null;
    }

    setDetectingLoc(true);
    setInitializingLocation(true);
    setLocationError(null);

    try {
      const result = await pickCurrentLocation();

      if (!result.ok) {
        setShowMapPreview(false);
        setLocationError(result.message);
        setGeocodingStatus("IDLE");
        return;
      }

      applyParsedGeocode(result);
      setFormData((prev) => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude,
      }));
      setGeocodingStatus("FOUND");
      setShowMapPreview(true);
    } catch {
      setLocationError(
        "We couldn't detect your location. Please enter your address manually.",
      );
      setShowMapPreview(false);
    } finally {
      setDetectingLoc(false);
      setInitializingLocation(false);
      locationInitKeyRef.current = editingId ?? "new";
    }
  };

  const handleUseCurrentLocation = () => {
    void applyGpsLocation(true);
  };

  const handleMapLocationChange = async (latitude: number, longitude: number) => {
    setFormData((prev) => ({ ...prev, latitude, longitude }));
    setGeocodingStatus("SEARCHING");

    try {
      const parsed = await reverseGeocodeDetailedForPicker(latitude, longitude);
      applyParsedGeocode(parsed);
      setGeocodingStatus("FOUND");
    } catch {
      setGeocodingStatus("NOT_FOUND");
    }
  };

  const completeAddressSelection = (address: Address) => {
    useLocationStore.getState().setDeliveryAddress({
      lat: address.latitude,
      lng: address.longitude,
      label: address.label || address.addressText,
      formattedAddress: address.addressText,
      source: "saved",
    });
    onSelect(address);
    onClose();
  };

  const handleSelectAddress = async (address: Address) => {
    setCheckingOutlet(true);
    try {
      const freshAddress = await AddressService.getOne(address.id);

      const validation = validateAddressForCheckout({
        address: freshAddress,
        cartOutletId,
        cartOutletName: cartOutletName ?? getEffectiveCartOutletName(),
      });

      if (validation.status === "not_serviceable") {
        setPopup({ type: "error", message: validation.message });
        return;
      }

      if (validation.status === "outlet_mismatch") {
        setPopup({
          type: "outlet_mismatch",
          message: `You selected an address served by the ${validation.addressOutletName} outlet.\n\nYour cart currently contains products from the ${validation.cartOutletName} outlet.\n\nChoose one:`,
          cancelLabel: "Keep current cart",
          confirmLabel: "Switch outlet & clear cart",
          onCancel: () => setPopup(null),
          onConfirm: async () => {
            setPopup(null);
            setCheckingOutlet(true);
            try {
              await clearCart();
              await applySavedAddressOutlet(freshAddress);
              completeAddressSelection(freshAddress);
            } catch (error) {
              console.error("Failed to switch outlet for address:", error);
              setPopup({
                type: "error",
                message: "Could not switch to the outlet for this address.",
              });
            } finally {
              setCheckingOutlet(false);
            }
          },
        });
        return;
      }

      completeAddressSelection(freshAddress);
    } catch (error) {
      console.error("Error validating address:", error);
      setPopup({
        type: "error",
        message: mapAddressApiError(error, "Failed to verify delivery address."),
      });
    } finally {
      setCheckingOutlet(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!details.houseNo.trim()) { setPopup({ type: "error", message: "Please enter House / Flat Number." }); return; }
    if (!details.area.trim()) { setPopup({ type: "error", message: "Please enter Street / Area details." }); return; }
    if (!details.pincode.trim() || details.pincode.length < 6) { setPopup({ type: "error", message: "Please enter a valid Pincode." }); return; }
    if (formData.type === "OTHER" && !formData.label.trim()) {
      setPopup({ type: "error", message: "Please enter a custom label for this address." });
      return;
    }

    const locationTail = [
      details.area.trim(),
      details.city.trim(),
      details.state.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const finalAddress = `${details.houseNo.trim()}, ${details.landmark ? details.landmark.trim() + ", " : ""}${locationTail} - ${details.pincode.trim()}`;

    const payload = {
      ...formData,
      addressText: finalAddress,
      houseNumber: details.houseNo.trim(),
      street: details.area.trim(),
      landmark: details.landmark.trim() || undefined,
      pincode: details.pincode.trim(),
    };

    if (payload.latitude === 0 || payload.longitude === 0) {
       const coords = await forwardGeocode(details.area);
       if (!coords) {
         setPopup({ type: "error", message: "We couldn't locate this address. Please use 'Current Location' or check the details." });
         return;
       }
       payload.latitude = coords.lat;
       payload.longitude = coords.lng;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await AddressService.update(editingId, payload);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await AddressService.create(payload);
        setAddresses((prev) => [...prev, created]);
      }
      setView("LIST");
    } catch (error) {
      console.error(error);
      setPopup({
        type: "error",
        message: mapAddressApiError(error, "Failed to save address. Please try again."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const { hasHome, hasWork } = getTakenTypes(addresses, editingId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* POPUP OVERLAY */}
      {popup && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center border border-slate-100 transform transition-all scale-100">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${popup.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            <h3 className="font-bold text-slate-800 mb-2">
              {popup.type === "confirm"
                ? "Confirm"
                : popup.type === "outlet_mismatch"
                  ? "Different delivery outlet"
                  : popup.type === "error"
                    ? "Delivery unavailable"
                    : "Success"}
            </h3>
            <p className="text-slate-500 text-sm mb-6 whitespace-pre-line">{popup.message}</p>
            <div className="flex gap-3 justify-center">
              {popup.type === "confirm" || popup.type === "outlet_mismatch" ? (
                <>
                  <button
                    onClick={() => {
                      if (popup.onCancel) popup.onCancel();
                      else setPopup(null);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    {popup.cancelLabel ?? "Cancel"}
                  </button>
                  <button
                    onClick={popup.onConfirm}
                    className={`px-4 py-2 font-bold rounded-xl transition shadow-lg ${
                      popup.type === "outlet_mismatch"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                        : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30"
                    }`}
                  >
                    {popup.confirmLabel ?? "Confirm"}
                  </button>
                </>
              ) : (
                <button 
                    onClick={() => { 
                        if (popup.onConfirm) popup.onConfirm();
                        setPopup(null);
                    }} 
                    className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                    Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN MODAL */}
      <div className={`bg-white w-full ${view === "FORM" ? "max-w-lg" : "max-w-md"} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up relative`}>
        
        {/* Loading Overlay */}
        {checkingOutlet && (
             <div className="absolute inset-0 z-50 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-emerald-600 w-10 h-10 mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Checking delivery availability...</p>
             </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800">
            {view === "LIST" ? "Select Delivery Address" : (editingId ? "Edit Address" : "Add New Address")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-800"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${view === "FORM" ? "" : "p-4"}`}>
          {loading ? (
            <div className="flex justify-center py-12 p-4"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
          ) : view === "LIST" ? (
            <div className="space-y-3 p-4">
              {addresses.map((addr) => {
                const isActive = false;
                return (
                    <div key={addr.id} className="relative group">
                        <button 
                            onClick={() => handleSelectAddress(addr)} 
                            className={`w-full text-left p-4 pr-20 rounded-xl border transition-all flex items-start gap-3 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30`}
                        >
                        <div className={`mt-1 text-slate-400 group-hover:text-emerald-600`}>
                            {addr.type === "HOME" ? <Home size={20} /> : addr.type === "WORK" ? <Briefcase size={20} /> : <MapPin size={20} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-900">{addr.label}</div>
                            </div>
                            <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{addr.addressText}</div>
                        </div>
                        </button>
                        <div className="absolute top-3 right-3 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); startEditMode(addr); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"><Pencil size={14} /></button>
                        <button onClick={(e) => handleDelete(addr.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"><Trash2 size={14} /></button>
                        </div>
                    </div>
                );
              })}
              <button onClick={() => startAddMode()} className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl text-slate-500 hover:text-emerald-600 font-semibold flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-emerald-50/30"><Plus size={20} /> Add New Address</button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col">
              <AddressFormMapHero
                visible={showMapPreview}
                latitude={formData.latitude}
                longitude={formData.longitude}
                loading={initializingLocation}
                onLocationChange={handleMapLocationChange}
                onRecenter={handleUseCurrentLocation}
                recentering={detectingLoc}
              />

              <div className="space-y-5 p-4">
                {locationError ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                    {locationError}
                  </p>
                ) : null}

                {geocodingStatus === "SEARCHING" ? (
                  <p className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating address from map...
                  </p>
                ) : null}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Save as
                  </label>
                  <div className="flex gap-2">
                    {(["HOME", "WORK", "OTHER"] as const).map((t) => {
                      const isTaken = (t === "HOME" && hasHome) || (t === "WORK" && hasWork);
                      const isSelected = formData.type === t;
                      const label =
                        t === "HOME" ? "Home" : t === "WORK" ? "Work" : "Other";
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isTaken}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              type: t,
                              label: t === "OTHER" ? formData.label : label,
                            })
                          }
                          className={`flex-1 rounded-full border py-2.5 text-sm font-semibold transition ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                          } ${isTaken ? "cursor-not-allowed opacity-40" : ""}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.type === "OTHER" ? (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Custom label
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Grandma's House, Warehouse"
                      required
                    />
                  </div>
                ) : null}

                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Delivery details
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        House / Flat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={details.houseNo}
                        onChange={(e) =>
                          setDetails({ ...details, houseNo: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="#102, 1st Floor"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={details.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setDetails({ ...details, pincode: val });
                        }}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="5600xx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                      Street / Area <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={details.area}
                      onChange={(e) =>
                        setDetails({ ...details, area: e.target.value })
                      }
                      className="h-20 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Street, locality, area"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                      Landmark <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={details.landmark}
                      onChange={(e) =>
                        setDetails({ ...details, landmark: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Near Apollo Pharmacy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        City
                      </label>
                      <input
                        type="text"
                        value={details.city}
                        onChange={(e) =>
                          setDetails({ ...details, city: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        State
                      </label>
                      <input
                        type="text"
                        value={details.state}
                        onChange={(e) =>
                          setDetails({ ...details, state: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Karnataka"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setView("LIST")}
                    className="flex-1 rounded-xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || geocodingStatus === "SEARCHING"}
                    className="flex-[2] rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                  >
                    {submitting ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : editingId ? (
                      "Update Address"
                    ) : (
                      "Save Address"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}