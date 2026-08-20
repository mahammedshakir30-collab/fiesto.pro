export function buildWhatsAppLink(
  targetNumber: string,
  messageTemplate: string,
  variables: Record<string, string | number> = {}
) {
  let message = messageTemplate;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${targetNumber}?text=${encodedMessage}`;
}

export function buildWhatsAppUpgradeLink(
  festival: { id: string; name: string },
  user: { name?: string | null; email?: string | null },
  currentPlanTier: { name: string },
  targetPlanTier: { name: string; monthlyPrice: number },
  billingInterval: string = 'monthly'
) {
  const targetNumber = '919900228866'; // WhatsApp number in international format without '+'
  
  const organizerName = user.name || 'Organizer';
  const organizerEmail = user.email || 'N/A';

  const messageTemplate = `Hi, I'd like to upgrade my FestOS plan.

Festival: {{festivalName}} ({{festivalId}})
Organizer: {{organizerName}} ({{organizerEmail}})
Current Plan: {{currentPlan}}
Requested Plan: {{targetPlan}} (₹{{targetPrice}}/{{interval}})

Please share payment details.`;

  return buildWhatsAppLink(targetNumber, messageTemplate, {
    festivalName: festival.name,
    festivalId: festival.id,
    organizerName,
    organizerEmail,
    currentPlan: currentPlanTier.name,
    targetPlan: targetPlanTier.name,
    targetPrice: targetPlanTier.monthlyPrice,
    interval: billingInterval
  });
}
