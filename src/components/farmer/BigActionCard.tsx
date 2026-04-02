"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface BigActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  bgColor: string;
  badge?: string;
}

export function BigActionCard({
  title,
  description,
  icon,
  href,
  bgColor,
  badge,
}: BigActionCardProps) {
  return (
    <Link
      href={href}
      className="action-card relative flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      {/* Badge (top-right) */}
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-white/30 px-2.5 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}

      {/* Icon */}
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>

      {/* Text content */}
      <div className="mt-auto">
        <h3 className="text-lg font-bold leading-snug text-white">{title}</h3>
        <p className="mt-0.5 text-sm leading-snug text-white/80">
          {description}
        </p>
      </div>
    </Link>
  );
}
