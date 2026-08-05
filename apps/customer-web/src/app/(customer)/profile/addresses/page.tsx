"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Home,
  Briefcase,
  MapPin,
  Trash2,
  ArrowLeft,
  Pencil,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import { AddressFormMapHero } from "@/features/addresses/components/AddressFormMapHero";
import {
  pickCurrentLocation,
  reverseGeocodeDetailedForPicker,
  type ParsedGeocodedAddress,
} from "@/features/addresses/utils/pick-current-location";
import { forwardGeocode } from "@/features/location/utils/reverseGeocode";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

export default function AddressListPage() {
  const router = useRouter();
  const { isAuthenticated, sessionChecked } = useCustomerAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupState | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [initializingLocation, setInitializingLocation] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const suppressAreaForwardGeocodeRef = useRef(false);
  const locationInitKeyRef = useRef<string | null>(null);

  const resetLocationPreview = () => {
    setShowMapPreview(false);
    setLocationError(null);
    setInitializingLocation(false);
    locationInitKeyRef.current = null;
  };

  const [formData, setFormData] = useState({
    label: "Home",
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    latitude: 0,
    longitude: 0,
  });

  const [details, setDetails] = useState({
    houseNo: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!sessionChecked) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    void loadAddresses();
  }, [sessionChecked, isAuthenticated, router]);

  useEffect(() => {
    if (!showFormModal) return;

    const initKey = editingId ?? "new";
    if (locationInitKeyRef.current === initKey) return;
    locationInitKeyRef.current = initKey;

    if (editingId && formData.latitude && formData.longitude) {
      setShowMapPreview(true);
      setLocationError(null);
      return;
    }

    void applyGpsLocation(false);
  }, [showFormModal, editingId]);

  const loadAddresses = async () => {
    try {
      const data = await AddressService.getAll();
      setAddresses(data.filter((a) => !a.isDeleted));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (addr?: Address) => {
    if (addr) {
      setEditingId(addr.id);
      setFormData({
        label: addr.label,
        type: addr.type,
        latitude: addr.latitude,
        longitude: addr.longitude,
      });
      const pinMatch = addr.addressText.match(/\b\d{6}\b/);
      const pincode = pinMatch ? pinMatch[0] : "";
      let areaPart = addr.addressText.replace(pincode, "").replace(/-\s*$/, "").trim();
      let houseNo = "";
      const firstCommaIndex = areaPart.indexOf(",");
      if (firstCommaIndex > -1 && firstCommaIndex < 20) {
        houseNo = areaPart.substring(0, firstCommaIndex).trim();
        areaPart = areaPart.substring(firstCommaIndex + 1).trim();
      }
      setDetails({
        houseNo: addr.houseNumber ?? houseNo,
        area: addr.street ?? areaPart,
        landmark: addr.landmark ?? "",
        city: "",
        state: "",
        pincode: addr.pincode ?? pincode,
      });
      resetLocationPreview();
    } else {
      setEditingId(null);
      const hasHome = addresses.some((a) => a.type === "HOME");
      const hasWork = addresses.some((a) => a.type === "WORK");
      const defaultType = !hasHome ? "HOME" : !hasWork ? "WORK" : "OTHER";
      setFormData({
        label:
          defaultType === "OTHER"
            ? ""
            : defaultType.charAt(0) + defaultType.slice(1).toLowerCase(),
        type: defaultType,
        latitude: 0,
        longitude: 0,
      });
      setDetails({
        houseNo: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });
      resetLocationPreview();
    }
    setShowFormModal(true);
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

    setDetecting(true);
    setInitializingLocation(true);
    setLocationError(null);

    try {
      const result = await pickCurrentLocation();

      if (!result.ok) {
        setShowMapPreview(false);
        setLocationError(result.message);
        return;
      }

      applyParsedGeocode(result);
      setFormData((prev) => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude,
      }));
      setShowMapPreview(true);
    } finally {
      setDetecting(false);
      setInitializingLocation(false);
      locationInitKeyRef.current = editingId ?? "new";
    }
  };

  const handleUseCurrent = () => {
    void applyGpsLocation(true);
  };

  const handleMapLocationChange = async (latitude: number, longitude: number) => {
    setFormData((prev) => ({ ...prev, latitude, longitude }));
    const parsed = await reverseGeocodeDetailedForPicker(latitude, longitude);
    applyParsedGeocode(parsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isTaken = addresses.some(
      (a) => a.type === formData.type && a.id !== editingId,
    );
    if (formData.type !== "OTHER" && isTaken) {
      return setPopup({
        type: "error",
        message: `You already have a ${formData.type} address saved.`,
      });
    }
    if (!details.area || !details.pincode) {
      return setPopup({
        type: "error",
        message: "Street/Locality and Pincode are required.",
      });
    }

    setSubmitting(true);
    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (finalLat === 0) {
      const coords = await forwardGeocode(`${details.area} ${details.pincode}`);
      if (coords) {
        finalLat = coords.lat;
        finalLng = coords.lng;
      }
    }

    try {
      const locationTail = [details.area.trim(), details.city.trim(), details.state.trim()]
        .filter(Boolean)
        .join(", ");
      const addressText = `${details.houseNo ? details.houseNo + ", " : ""}${details.landmark ? details.landmark + ", " : ""}${locationTail} - ${details.pincode}`;
      const payload = {
        ...formData,
        latitude: finalLat,
        longitude: finalLng,
        addressText,
        houseNumber: details.houseNo.trim() || undefined,
        street: details.area.trim(),
        landmark: details.landmark.trim() || undefined,
        pincode: details.pincode.trim(),
      };

      if (editingId) {
        await AddressService.update(editingId, payload);
      } else {
        await AddressService.create(payload);
      }

      setShowFormModal(false);
      loadAddresses();
      setPopup({ type: "success", message: "Address saved successfully!" });
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Could not save address. Check if this type already exists.";
      setPopup({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setPopup({
      type: "confirm",
      message: "This address will be removed from your saved list.",
      onConfirm: async () => {
        try {
          setPopup(null);
          await AddressService.delete(id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch {
          setPopup({ type: "error", message: "Failed to delete address" });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {popup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${popup.type === "error" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}
            >
              {popup.type === "error" ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
            </div>
            <p className="mb-6 text-sm text-slate-600">{popup.message}</p>
            {popup.type === "confirm" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setPopup(null)}
                  className="flex-1 rounded-xl bg-slate-100 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={popup.onConfirm}
                  className="flex-1 rounded-xl bg-red-500 py-2 font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPopup(null)}
                className="w-full rounded-xl bg-slate-900 py-2.5 font-semibold text-white"
              >
                Okay
              </button>
            )}
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-slate-900/40 backdrop-blur-[2px] md:items-center">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white md:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Address" : "Add New Address"}
                </h2>
                <p className="text-xs text-slate-400">Confirm your delivery location</p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
              <AddressFormMapHero
                visible={showMapPreview}
                latitude={formData.latitude}
                longitude={formData.longitude}
                loading={initializingLocation}
                onLocationChange={handleMapLocationChange}
                onRecenter={handleUseCurrent}
                recentering={detecting}
              />

              <div className="space-y-4 p-5">
                {locationError ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {locationError}
                  </p>
                ) : null}

                <div className="grid grid-cols-3 gap-2">
                  {(["HOME", "WORK", "OTHER"] as const).map((t) => {
                    const isTaken = addresses.some(
                      (a) => a.type === t && a.id !== editingId,
                    );
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={t !== "OTHER" && isTaken}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            type: t,
                            label:
                              t === "OTHER"
                                ? formData.label
                                : t.charAt(0) + t.slice(1).toLowerCase(),
                          })
                        }
                        className={`rounded-full border py-2 text-xs font-semibold ${
                          formData.type === t
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 text-slate-600"
                        } ${t !== "OTHER" && isTaken ? "opacity-40" : ""}`}
                      >
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>

                {formData.type === "OTHER" ? (
                  <input
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="Custom label"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                    required
                  />
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={details.houseNo}
                    onChange={(e) =>
                      setDetails({ ...details, houseNo: e.target.value })
                    }
                    placeholder="House / Flat"
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                  />
                  <input
                    value={details.pincode}
                    onChange={(e) =>
                      setDetails({ ...details, pincode: e.target.value })
                    }
                    placeholder="Pincode"
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                    required
                  />
                </div>

                <textarea
                  value={details.area}
                  onChange={(e) => setDetails({ ...details, area: e.target.value })}
                  placeholder="Street / Area"
                  className="h-20 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm"
                  required
                />

                <input
                  value={details.landmark}
                  onChange={(e) =>
                    setDetails({ ...details, landmark: e.target.value })
                  }
                  placeholder="Landmark (optional)"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={details.city}
                    onChange={(e) => setDetails({ ...details, city: e.target.value })}
                    placeholder="City"
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                  />
                  <input
                    value={details.state}
                    onChange={(e) => setDetails({ ...details, state: e.target.value })}
                    placeholder="State"
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  {submitting ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="customer-page-shell mobile-container max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Saved Addresses</h1>
              <p className="text-sm text-slate-400">Manage your delivery locations</p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-600" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              No saved addresses yet.
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    {addr.type === "HOME" ? (
                      <Home size={20} />
                    ) : addr.type === "WORK" ? (
                      <Briefcase size={20} />
                    ) : (
                      <MapPin size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{addr.label}</h3>
                    <p className="mt-1 text-sm text-slate-500">{addr.addressText}</p>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2">
                  <button
                    onClick={() => openModal(addr)}
                    className="rounded-xl border border-slate-100 p-2 text-slate-400 hover:text-emerald-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-xl border border-slate-100 p-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
