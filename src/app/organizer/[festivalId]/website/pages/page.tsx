import { getSitePages } from "@/actions/website";
import { WebsitePagesClient } from "./WebsitePagesClient";

export default async function WebsitePagesPage({ params }: { params: { festivalId: string } }) {
  const pages = await getSitePages(params.festivalId);
  return <WebsitePagesClient festivalId={params.festivalId} initialPages={pages} />;
}
