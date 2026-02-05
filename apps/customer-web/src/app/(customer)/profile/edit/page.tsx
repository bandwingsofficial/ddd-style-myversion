"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, User, Mail, Calendar, Users } from "lucide-react";

// Using relative paths to ensure they work regardless of alias configuration
import { profileApi } from "@/features/customer-profile/api/profile.api";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "MALE",
    dob: "",
  });

  useEffect(() => {
    // Fetch current data to pre-fill the form
    profileApi.getProfile()
      .then((res) => {
        // Handle case where res.data might be null (new user)
        if (res.success && res.data) {
          setFormData({
            fullName: res.data.fullName || "",
            email: res.data.email || "",
            gender: res.data.gender || "MALE",
            dob: res.data.dob ? res.data.dob.split("T")[0] : "",
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // payload matches your POST /me/profile/upsert requirements
      const response = await profileApi.upsertProfile(formData);
      if (response.success) {
        // Use router.push to go back to the profile view
        router.push("/profile");
        router.refresh(); // Forces Next.js to re-fetch the updated data
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 bg-emerald-200 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pb-24 pt-[110px] md:pt-[140px] px-4">
        <section className="mx-auto max-w-md">
          
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.back()} 
              className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Edit Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block text-left">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block text-left">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  placeholder="email@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block text-left">Gender</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none text-slate-800"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block text-left">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={saving}
              type="submit" 
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-100"
            >
              <Save size={20} />
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>

          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}