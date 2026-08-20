import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResultsLayoutClient } from "./ResultsLayoutClient";

export default async function ResultsLayoutPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const settings = await prisma.siteSettings.findUnique({ where: { festivalId: params.festivalId } });
  if (!settings) redirect(`/organizer/${params.festivalId}/website`);

  return <ResultsLayoutClient festivalId={params.festivalId} initialSettings={settings as any} />;
}
