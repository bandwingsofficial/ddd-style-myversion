// apps/backoffice-web/src/app/(protected)/profile/page.tsx
import { ProfileForm } from "@/features/super-admin/components/profile-form";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* HEADER SECTION - Scaled down for better balance */}
      <header className="mb-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Profile</h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage your super admin credentials and profile details
          </p>
        </div>
      </header>

      {/* REMOVED: The outer white div wrapper. 
          ProfileForm already provides its own card styling and internal padding.
      */}
      <ProfileForm />
    </div>
  );
}