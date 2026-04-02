export default function ScanResultLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
      <p className="text-xl text-gray-600">नतीजा लोड हो रहा है...</p>
    </div>
  );
}
