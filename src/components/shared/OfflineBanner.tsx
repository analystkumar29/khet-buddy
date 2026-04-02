"use client";

import { useOffline } from "@/hooks/useOffline";
import { useLanguage } from "@/hooks/useLanguage";

export function OfflineBanner() {
  const isOffline = useOffline();
  const { strings } = useLanguage();

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="offline-banner flex items-center justify-center gap-2 text-base font-medium"
    >
      <span aria-hidden="true" className="text-lg">
        ⚠️
      </span>
      <span>{strings.common.offline}</span>
    </div>
  );
}
