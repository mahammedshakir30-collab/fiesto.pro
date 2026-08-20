import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewsClient } from "./NewsClient";
import { getNewsPosts } from "@/actions/website";

export default async function NewsPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const settings = await prisma.siteSettings.findUnique({ where: { festivalId: params.festivalId } });
  if (!settings) redirect(`/organizer/${params.festivalId}/website`);

  const items = await getNewsPosts(params.festivalId);

  return <NewsClient festivalId={params.festivalId} initialSettings={settings as any} initialItems={items} />;
}
