"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { accountDeletionApi } from "@/features/customer-auth/api/account-deletion.api";
import {
  beginSessionTermination,
  cancelSessionTermination,
  syncAfterLogout,
} from "@/features/customer-auth/services/auth-sync.service";
import { useRouter } from "next/navigation";

type Step = "phone" | "otp" | "confirm" | "done";

export default function DeleteAccountClient() {
  const router = useRouter();
  const otpRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [ackPermanent, setAckPermanent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const formattedPhone = `+91${phone}`;

  const extractError = (err: unknown) => {
    const ax = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      ax?.response?.data?.message ||
      ax?.message ||
      "Something went wrong. Please try again."
    );
  };

  const handleRequestOtp = async () => {
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    if (sendingOtp) return;

    try {
      setSendingOtp(true);
      setError(null);
      await accountDeletionApi.requestPublicOtp(formattedPhone);
      setStep("otp");
      setTimer(60);
      setOtp("");
      toast.success(
        "If an account exists for this number, an OTP has been sent",
      );
      setTimeout(() => otpRef.current?.focus(), 50);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || sendingOtp) return;
    await handleRequestOtp();
  };

  const handleContinueToConfirm = () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleDelete = async () => {
    if (!ackPermanent || submitting || otp.length !== 6) return;

    try {
      setSubmitting(true);
      setError(null);
      beginSessionTermination();
      await accountDeletionApi.confirmPublic(formattedPhone, otp);
      syncAfterLogout();
      setStep("done");
      toast.success("Account deletion completed");
    } catch (err) {
      cancelSessionTermination();
      const message = extractError(err);
      setError(message);
      setStep("otp");
      setOtp("");
      setAckPermanent(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center mb-8">
          <p className="text-xs font-extrabold tracking-[0.35em] text-emerald-700 uppercase">
            Canten
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight">
            Delete Your Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Permanently delete your Canten customer account after phone OTP
            verification.
          </p>
        </div>

        <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
          {step !== "done" && (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">How it works</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Enter the phone number linked to your Canten account.</li>
                <li>Verify ownership with an OTP.</li>
                <li>Confirm account deletion.</li>
                <li>
                  Your account and applicable personal data will be deleted.
                </li>
                <li>
                  Historical business and financial records may be retained
                  where required.
                </li>
              </ol>
            </div>
          )}

          {step === "phone" && (
            <>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                Phone Number
              </label>
              <div className="flex items-center h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-emerald-500">
                <span className="text-slate-700 text-sm font-bold pr-3 border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  disabled={sendingOtp}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    if (error) setError(null);
                  }}
                  className="flex-1 bg-transparent px-3 outline-none font-semibold text-slate-800"
                  placeholder="10-digit mobile number"
                />
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <p className="text-sm text-slate-600">
                Enter the OTP sent to <strong>{formattedPhone}</strong>
              </p>
              <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                disabled={submitting}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError(null);
                }}
                className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-2xl tracking-[0.4em] font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="------"
              />
              <button
                type="button"
                disabled={timer > 0 || sendingOtp || submitting}
                onClick={handleResend}
                className="text-sm font-bold text-emerald-700 disabled:text-slate-400"
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-800 space-y-2">
                <p className="font-bold">Final confirmation</p>
                <p>
                  This permanently deletes your Canten account and personal
                  data for {formattedPhone}. Orders and payments may be retained
                  for business and legal requirements.
                </p>
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ackPermanent}
                  disabled={submitting}
                  onChange={(e) => setAckPermanent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I understand this is permanent and I want to delete this
                  account.
                </span>
              </label>
            </>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-4">
              <p className="text-lg font-black text-slate-800">
                Deletion request completed
              </p>
              <p className="text-sm text-slate-500">
                If an account existed for this phone number, it has been
                permanently deleted. You can close this page or return home.
              </p>
              <button
                type="button"
                onClick={() => router.replace("/")}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm"
              >
                Go to Home
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {step !== "done" && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {step === "phone" && (
                <button
                  type="button"
                  disabled={sendingOtp || phone.length !== 10}
                  onClick={handleRequestOtp}
                  className="flex-1 h-12 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60"
                >
                  {sendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              )}
              {step === "otp" && (
                <button
                  type="button"
                  disabled={otp.length !== 6 || submitting}
                  onClick={handleContinueToConfirm}
                  className="flex-1 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-60"
                >
                  Continue
                </button>
              )}
              {step === "confirm" && (
                <button
                  type="button"
                  disabled={!ackPermanent || submitting}
                  onClick={handleDelete}
                  className="flex-1 h-12 rounded-2xl bg-red-600 text-white font-bold text-sm disabled:opacity-60"
                >
                  {submitting ? "Deleting..." : "Delete Account"}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already signed in?{" "}
          <Link href="/profile" className="text-emerald-700 font-bold">
            Manage account in Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
