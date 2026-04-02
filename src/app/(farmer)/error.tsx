"use client";

export default function FarmerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">😔</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        कुछ गलत हो गया / Something went wrong
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="min-h-[48px] rounded-xl bg-khet-green px-8 text-lg font-semibold text-white active:bg-green-800"
      >
        फिर से कोशिश करें / Try Again
      </button>
    </div>
  );
}
