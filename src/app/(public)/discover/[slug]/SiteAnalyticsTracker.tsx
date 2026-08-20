"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logAnalyticsEvent } from "@/actions/analytics";

export function SiteAnalyticsTracker({ festivalId }: { festivalId: string }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // We only log when pathname changes
    logAnalyticsEvent(festivalId, pathname).catch(() => {});
  }, [pathname, festivalId]);
  
  return null;
}
