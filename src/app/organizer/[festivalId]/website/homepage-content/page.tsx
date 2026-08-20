import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HomepageContentClient } from "./HomepageContentClient";

export default async function HomepageContentPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const settings = await prisma.siteSettings.findUnique({ where: { festivalId: params.festivalId } });
  if (!settings) redirect(`/organizer/${params.festivalId}/website`);

  return <HomepageContentClient festivalId={params.festivalId} initialSettings={settings as any} />;
}
