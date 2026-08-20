"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAnalyticsEvent(festivalId: string, path: string) {
  try {
    const reqHeaders = headers();
    const referrer = reqHeaders.get('referer') || null;

    await prisma.siteAnalyticsEvent.create({
      data: {
        festivalId,
        path,
        referrer
      }
    });
  } catch (error) {
    console.error("Failed to log analytics event", error);
  }
}
