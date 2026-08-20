import { getSiteSettings } from "@/actions/website";
import { WebsiteOverviewClient } from "./WebsiteOverviewClient";

export default async function WebsiteOverviewPage({ params }: { params: { festivalId: string } }) {
  const settings = await getSiteSettings(params.festivalId);
  return <WebsiteOverviewClient festivalId={params.festivalId} initialSettings={settings} />;
}
