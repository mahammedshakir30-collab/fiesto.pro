import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VisibilityClient } from "./VisibilityClient";

export default async function VisibilityPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const settings = await prisma.siteSettings.findUnique({ where: { festivalId: params.festivalId } });
  if (!settings) redirect(`/organizer/${params.festivalId}/website`);

  return <VisibilityClient festivalId={params.festivalId} initialSettings={settings as any} />;
}
