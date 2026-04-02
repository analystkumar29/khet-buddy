export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-24 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
