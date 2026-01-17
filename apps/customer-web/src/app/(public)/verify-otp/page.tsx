import { Suspense } from "react";
import VerifyOtpClient from "./VerifyOtpClient";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpClient />
    </Suspense>
  );
}
