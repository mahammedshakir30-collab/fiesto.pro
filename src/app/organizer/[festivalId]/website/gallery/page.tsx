import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GalleryClient } from "./GalleryClient";
import { getGalleryItems } from "@/actions/website";

export default async function GalleryPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const settings = await prisma.siteSettings.findUnique({ where: { festivalId: params.festivalId } });
  if (!settings) redirect(`/organizer/${params.festivalId}/website`);

  const items = await getGalleryItems(params.festivalId);

  return <GalleryClient festivalId={params.festivalId} initialSettings={settings as any} initialItems={items} />;
}
