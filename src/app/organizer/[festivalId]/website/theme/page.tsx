import { getSiteSettings } from "@/actions/website";
import { WebsiteThemeClient } from "./WebsiteThemeClient";

export default async function WebsiteThemePage({ params }: { params: { festivalId: string } }) {
  const settings = await getSiteSettings(params.festivalId);
  return <WebsiteThemeClient festivalId={params.festivalId} initialSettings={settings} />;
}
