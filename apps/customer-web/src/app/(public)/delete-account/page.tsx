import Link from "next/link";

export const metadata = {
  title: "Delete Your Canten Account | Canten",
  description:
    "Learn how to permanently delete your Canten customer account from your signed-in Profile by typing DELETE.",
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-extrabold tracking-[0.35em] text-emerald-700 uppercase">
            Canten
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Delete Your Canten Account
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Customers can delete their Canten account from their signed-in
            Canten profile. This page explains how account deletion works.
          </p>
        </div>

        <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-800">
              How to delete your account
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed">
              <li>Open Canten and sign in to your account.</li>
              <li>Open your Profile.</li>
              <li>Select &quot;Delete Account&quot;.</li>
              <li>Review the account deletion warning.</li>
              <li>
                Type exactly:{" "}
                <span className="font-mono font-bold text-red-600">DELETE</span>
              </li>
              <li>Confirm the deletion.</li>
            </ol>
            <p className="text-sm sm:text-[0.95rem] text-slate-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 leading-relaxed">
              No phone number or OTP is required to confirm account deletion.
              Account deletion is confirmed by typing{" "}
              <span className="font-mono font-bold text-red-600">DELETE</span>{" "}
              while signed in.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-800">
              What is deleted
            </h2>
            <p className="text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed">
              When your account is deleted, customer-owned account information
              is removed according to Canten&apos;s account deletion process,
              including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed">
              <li>Customer account</li>
              <li>Customer profile information</li>
              <li>Saved addresses</li>
              <li>Customer cart data</li>
              <li>Active customer sessions</li>
              <li>Authentication/session credentials</li>
              <li>
                Other customer-specific account data that is eligible for
                deletion
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-800">
              What may be retained
            </h2>
            <p className="text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed">
              Historical business records may be retained where required for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed">
              <li>Business operations</li>
              <li>Accounting</li>
              <li>Payment records</li>
              <li>Support</li>
              <li>Legal/regulatory requirements</li>
            </ul>
            <p className="text-sm sm:text-[0.95rem] text-slate-600 leading-relaxed">
              In particular, historical orders and related business records may
              be retained. Orders and payment/business records are not deleted
              as part of account deletion when retention is required.
            </p>
          </section>

          <section className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4 text-center">
            <p className="text-sm text-slate-600 leading-relaxed">
              After signing in, go to{" "}
              <span className="font-bold text-slate-800">
                Profile → Delete Account
              </span>{" "}
              and follow the deletion instructions.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
            >
              Sign in to Canten
            </Link>
          </section>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already signed in?{" "}
          <Link href="/profile" className="text-emerald-700 font-bold">
            Go to Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
