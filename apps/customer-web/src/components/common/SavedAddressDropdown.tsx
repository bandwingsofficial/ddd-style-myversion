// src/components/common/SavedAddressDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, MapPin, Home, Briefcase } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service"; // Ensure this path is correct

interface SavedAddressDropdownProps {
  onSelect: (address: Address) => void;
  selectedAddress?: Address | null;
}

export default function SavedAddressDropdown({ onSelect, selectedAddress }: SavedAddressDropdownProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await AddressService.getAll();
        setAddresses(data.filter((a) => !a.isDeleted));
      } catch (error) {
        console.error("Failed to load saved addresses", error);
      }
    };

    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (address: Address) => {
    onSelect(address);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-slate-700 font-bold text-sm focus:outline-none"
      >
        <span className="truncate max-w-[150px]">
          {selectedAddress ? selectedAddress.label : "Select Address"}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          {addresses.length > 0 ? (
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 group"
                >
                  <div className="mt-0.5 text-slate-400 group-hover:text-emerald-600 transition-colors">
                    {addr.type === "HOME" ? <Home size={16} /> : addr.type === "WORK" ? <Briefcase size={16} /> : <MapPin size={16} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-slate-700 text-sm truncate">{addr.label}</div>
                    <div className="text-xs text-slate-500 truncate">{addr.addressText}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">No saved addresses found.</div>
          )}
        </div>
      )}
    </div>
  );
}