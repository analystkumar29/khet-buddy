"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/scans", label: "Scans", icon: "🔬" },
  { href: "/dashboard/tasks", label: "Tasks", icon: "📋" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-khet-green text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <h1 className="text-lg font-bold">KhetBuddy Dashboard</h1>
        </div>
        <Link
          href="/home"
          className="text-sm bg-white/20 px-3 py-1.5 rounded-lg"
        >
          हिंदी मोड
        </Link>
      </header>

      <nav className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                pathname === item.href
                  ? "border-khet-green text-khet-green"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}
