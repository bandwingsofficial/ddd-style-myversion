// apps/backoffice-web/src/features/super-admin/components/profile-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profileSchema, ProfileFormValues, ProfileData } from "../types";
import { SuperAdminApi } from "../api/use-profile";

export const ProfileForm = () => {
  const [initialData, setInitialData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<ProfileFormValues | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", avatarUrl: "", title: "", phone: "", notes: "" },
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await SuperAdminApi.getProfile();
      if (data) {
        setInitialData(data);
        form.reset(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // triggered when user clicks save button
  const handlePreSubmit = (values: ProfileFormValues) => {
    if (initialData) {
      // If updating, show the popup
      setPendingData(values);
      setShowConfirm(true);
    } else {
      // If creating for the first time, save immediately
      executeSubmit(values);
    }
  };

  const executeSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      setShowConfirm(false);
      
      const payload = {
        ...values,
        phone: values.phone.startsWith('+') ? values.phone : `+91${values.phone}`
      };

      let response;
      if (initialData) {
        response = await SuperAdminApi.updateProfile(payload);
        toast.success("Profile updated successfully");
      } else {
        response = await SuperAdminApi.createProfile(payload);
        toast.success("Profile created successfully");
      }
      
      setInitialData(response);
      form.reset(response);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  return (
    <>
      <form onSubmit={form.handleSubmit(handlePreSubmit)} className="space-y-6">
        {/* ... (Existing Input Fields stay the same) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
            <input {...form.register("fullName")} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Professional Title</label>
            <input {...form.register("title")} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
            <input {...form.register("phone")} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Avatar URL</label>
            <input {...form.register("avatarUrl")} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Notes</label>
          <textarea {...form.register("notes")} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all" />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
          {initialData ? "Update Profile" : "Create Profile"}
        </button>
      </form>

      {/* STANDARD POPUP MODAL */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-emerald-500/10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Update?</h3>
                <p className="text-gray-500 mb-8 font-medium">Are you sure you want to save these changes to your super admin profile?</p>
                
                <div className="flex w-full gap-3">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => pendingData && executeSubmit(pendingData)}
                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Yes, Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};