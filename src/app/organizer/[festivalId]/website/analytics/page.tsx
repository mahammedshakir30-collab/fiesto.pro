import { getSiteAnalytics } from "@/actions/website";
import { WebsiteAnalyticsClient } from "./WebsiteAnalyticsClient";

export default async function WebsiteAnalyticsPage({ params }: { params: { festivalId: string } }) {
  const analytics = await getSiteAnalytics(params.festivalId);
  return <WebsiteAnalyticsClient data={analytics} />;
}
