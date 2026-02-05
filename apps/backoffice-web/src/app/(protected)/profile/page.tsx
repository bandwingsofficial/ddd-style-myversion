// apps/backoffice-web/src/app/(protected)/profile/page.tsx
import { ProfileForm } from "@/features/super-admin/components/profile-form";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 font-medium">Manage your super admin credentials and profile details</p>
        </div>
      </header>
      
      <div className="bg-white rounded-[2.5rem] border border-emerald-500/10 p-10 shadow-xl shadow-emerald-900/5">
        <ProfileForm />
      </div>
    </div>
  );
}