"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractYouTubeVideoId } from "@/lib/utils";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true }
  });

  if (user?.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin access required");
  }

  return session;
}

export async function getActiveSetupVideo() {
  try {
    return await prisma.dashboardSetupVideo.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch active setup video:", error);
    return null;
  }
}

export async function getSetupVideoSettings() {
  try {
    return await prisma.dashboardSetupVideo.findFirst({
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch setup video settings:", error);
    return null;
  }
}

interface SaveSetupVideoInput {
  id?: string;
  title: string;
  source: "YOUTUBE" | "UPLOADED";
  youtubeUrl?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  active?: boolean;
}

export async function saveSetupVideo(input: SaveSetupVideoInput) {
  await requireSuperAdmin();

  if (!input.title?.trim()) {
    throw new Error("Title is required");
  }

  let finalYoutubeUrl: string | null = null;
  let finalFileUrl: string | null = null;
  let finalThumbnailUrl: string | null = input.thumbnailUrl || null;

  if (input.source === "YOUTUBE") {
    if (!input.youtubeUrl?.trim()) {
      throw new Error("YouTube URL is required when source is set to YouTube");
    }

    const videoId = extractYouTubeVideoId(input.youtubeUrl.trim());
    if (!videoId) {
      throw new Error("Invalid YouTube URL. Please provide a standard YouTube video, share, or embed link.");
    }

    finalYoutubeUrl = `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&playsinline=1&modestbranding=1`;
    if (!finalThumbnailUrl) {
      finalThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } else if (input.source === "UPLOADED") {
    if (!input.fileUrl?.trim()) {
      throw new Error("Video file URL is required when source is set to Uploaded Video");
    }
    finalFileUrl = input.fileUrl.trim();
  }

  const isActive = input.active !== false;

  // If this video is being set to active, deactivate other rows to preserve singleton invariant
  if (isActive) {
    await prisma.dashboardSetupVideo.updateMany({
      data: { active: false }
    });
  }

  let result;
  if (input.id) {
    result = await prisma.dashboardSetupVideo.update({
      where: { id: input.id },
      data: {
        title: input.title.trim(),
        source: input.source,
        youtubeUrl: finalYoutubeUrl,
        fileUrl: finalFileUrl,
        thumbnailUrl: finalThumbnailUrl,
        active: isActive
      }
    });
  } else {
    // If a singleton record already exists, update it, otherwise create
    const existing = await prisma.dashboardSetupVideo.findFirst();
    if (existing) {
      result = await prisma.dashboardSetupVideo.update({
        where: { id: existing.id },
        data: {
          title: input.title.trim(),
          source: input.source,
          youtubeUrl: finalYoutubeUrl,
          fileUrl: finalFileUrl,
          thumbnailUrl: finalThumbnailUrl,
          active: isActive
        }
      });
    } else {
      result = await prisma.dashboardSetupVideo.create({
        data: {
          title: input.title.trim(),
          source: input.source,
          youtubeUrl: finalYoutubeUrl,
          fileUrl: finalFileUrl,
          thumbnailUrl: finalThumbnailUrl,
          active: isActive
        }
      });
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/organizer/[festivalId]", "page");
  return { success: true, video: result };
}

export async function deleteSetupVideo(id?: string) {
  await requireSuperAdmin();

  if (id) {
    await prisma.dashboardSetupVideo.delete({
      where: { id }
    });
  } else {
    await prisma.dashboardSetupVideo.deleteMany();
  }

  revalidatePath("/admin/settings");
  revalidatePath("/organizer/[festivalId]", "page");
  return { success: true };
}
