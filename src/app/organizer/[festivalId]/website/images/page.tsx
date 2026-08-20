import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImagesClient } from "./ImagesClient";
import { getImages } from "@/actions/website";

export default async function ImagesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const images = await getImages(params.festivalId);

  return <ImagesClient festivalId={params.festivalId} initialItems={images} />;
}
