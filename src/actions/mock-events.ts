"use server";

import { notifyUsersByPermission } from "@/lib/notification-router";

/**
 * Mocks a Stripe payout failure webhook event.
 * Used for testing notifications in Phase 4 Validation.
 */
export async function forceStripePayoutFailure(festivalId: string) {
  await notifyUsersByPermission({
    festivalId,
    resource: "finance",
    action: "manage_payouts",
    title: "Payout Failed",
    body: "Your recent Stripe payout could not be processed. Please check your banking details.",
    type: "WARNING",
    link: `/dashboard/${festivalId}/settings`
  });

  return { success: true };
}
