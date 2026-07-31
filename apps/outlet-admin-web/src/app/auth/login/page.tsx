import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function OutletLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          Loading...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
