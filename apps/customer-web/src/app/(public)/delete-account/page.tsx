import { Suspense } from "react";
import DeleteAccountClient from "./DeleteAccountClient";

export const metadata = {
  title: "Delete Your Account | Canten",
  description:
    "Permanently delete your Canten customer account after phone OTP verification.",
};

export default function DeleteAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          Loading...
        </div>
      }
    >
      <DeleteAccountClient />
    </Suspense>
  );
}
