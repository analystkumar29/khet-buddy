"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-khet-green px-6 py-2 text-white font-medium hover:bg-green-800"
      >
        Try Again
      </button>
    </div>
  );
}
