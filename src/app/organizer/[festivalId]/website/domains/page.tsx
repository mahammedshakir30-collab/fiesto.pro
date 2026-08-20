import { getSiteSettings } from "@/actions/website";
import { WebsiteDomainsClient } from "./WebsiteDomainsClient";

export default async function WebsiteDomainsPage({ params }: { params: { festivalId: string } }) {
  const settings = await getSiteSettings(params.festivalId);
  return <WebsiteDomainsClient festivalId={params.festivalId} initialSettings={settings} />;
}
