"use client";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center space-y-4">
      <h2 className="text-lg font-semibold text-red-600">
        Failed to load products
      </h2>

      <p className="text-sm text-muted-foreground">
        {error.message}
      </p>

      <button
        onClick={reset}
        className="px-4 py-2 rounded bg-black text-white"
      >
        Retry
      </button>
    </div>
  );
}
