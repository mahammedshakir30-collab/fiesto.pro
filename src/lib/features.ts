export const FEATURE_REGISTRY = [
  {
    key: 'competitionMode',
    label: 'Competition & Judging',
    description: 'Enable scoring and leaderboards for your festival.'
  },
  {
    key: 'vendorLeaderboard',
    label: 'Vendor Leaderboard',
    description: 'Opt-in to the vendor ranking system.'
  },
  {
    key: 'customDomain',
    label: 'Custom Domain',
    description: 'Host your public site on your own domain.'
  },
  {
    key: 'advancedAnalytics',
    label: 'Advanced Analytics',
    description: 'Unlock detailed traffic and conversion insights.'
  }
];

export function isFeatureEntitled(planEntitlements: any, featureKey: string): boolean {
  if (!planEntitlements) return false;
  
  try {
    const parsed = typeof planEntitlements === 'string' ? JSON.parse(planEntitlements) : planEntitlements;
    return !!parsed[featureKey];
  } catch (e) {
    return false;
  }
}
