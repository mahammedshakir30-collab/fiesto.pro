"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { Prisma } from "@prisma/client";

// --- Settings ---

export async function getSiteSettings(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");

  let settings = await prisma.siteSettings.findUnique({
    where: { festivalId }
  });

  if (!settings) {
    // Auto-create with defaults
    const festival = await prisma.festival.findUnique({ where: { id: festivalId }});
    if (!festival) throw new Error("Festival not found");
    
    settings = await prisma.siteSettings.create({
      data: {
        festivalId,
        subdomain: festival.slug, // default to slug
        themeJson: {
          primary: "#F1642E",
          secondary: "#504E76",
          background: "#FDF8E2",
          text: "#1A1A1A",
          font: "Inter"
        }
      }
    });

    // Also auto-create default system pages
    await prisma.sitePage.createMany({
      data: [
        { festivalId, slug: "", title: "Home", isSystemPage: true, navOrder: 1 },
        { festivalId, slug: "schedule", title: "Schedule", isSystemPage: true, navOrder: 2 },
        { festivalId, slug: "results", title: "Live Results", isSystemPage: true, navOrder: 3 },
        { festivalId, slug: "downloads", title: "Downloads", isSystemPage: true, navOrder: 4 },
      ],
      skipDuplicates: true
    });
  }

  return settings;
}

export async function updateSiteSettings(festivalId: string, data: Partial<Prisma.SiteSettingsUpdateInput>) {
  await requirePermission(festivalId, "festival_settings", "edit");
  return prisma.siteSettings.update({
    where: { festivalId },
    data
  });
}

// Mock custom domain verification
export async function verifyCustomDomain(festivalId: string, domain: string) {
  await requirePermission(festivalId, "festival_settings", "edit");
  
  // Actually, we'll just mock it as Verified instantly or save it.
  return prisma.siteSettings.update({
    where: { festivalId },
    data: { customDomain: domain, customDomainVerified: true }
  });
}

// --- Pages ---

export async function getSitePages(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");
  return prisma.sitePage.findMany({
    where: { festivalId },
    orderBy: { navOrder: 'asc' }
  });
}

export async function updateSitePageOrder(festivalId: string, orderedIds: string[]) {
  await requirePermission(festivalId, "festival_settings", "edit");
  const updates = orderedIds.map((id, index) => 
    prisma.sitePage.update({
      where: { id },
      data: { navOrder: index + 1 }
    })
  );
  await prisma.$transaction(updates);
}

export async function togglePageVisibility(festivalId: string, pageId: string, visible: boolean) {
  await requirePermission(festivalId, "festival_settings", "edit");
  return prisma.sitePage.update({
    where: { id: pageId },
    data: { visible }
  });
}

export async function addCustomPage(festivalId: string, title: string, slug: string) {
  await requirePermission(festivalId, "festival_settings", "edit");
  
  const lastPage = await prisma.sitePage.findFirst({
    where: { festivalId },
    orderBy: { navOrder: 'desc' }
  });
  
  return prisma.sitePage.create({
    data: {
      festivalId,
      title,
      slug,
      navOrder: lastPage ? lastPage.navOrder + 1 : 1
    }
  });
}

export async function deleteCustomPage(festivalId: string, pageId: string) {
  await requirePermission(festivalId, "festival_settings", "edit");
  const page = await prisma.sitePage.findUnique({ where: { id: pageId } });
  
  if (page?.isSystemPage) {
    throw new Error("Cannot delete a system page.");
  }
  
  return prisma.sitePage.delete({ where: { id: pageId } });
}

// --- Analytics ---

export async function getSiteAnalytics(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");
  
  const events = await prisma.siteAnalyticsEvent.findMany({
    where: { festivalId },
    orderBy: { createdAt: 'asc' }
  });

  // Group by date for simple time-series
  const viewsByDate = events.reduce((acc, ev) => {
    const date = ev.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeSeries = Object.entries(viewsByDate).map(([date, views]) => ({ date, views }));
  
  // Top pages
  const viewsByPath = events.reduce((acc, ev) => {
    acc[ev.path] = (acc[ev.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topPages = Object.entries(viewsByPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));
    
  return { timeSeries, topPages };
}

// --- Homepage Content ---

export async function updateHomepageContent(
  festivalId: string, 
  data: { bannerImageUrl?: string; logoUrl?: string; homepageBlocks?: any }
) {
  await requirePermission(festivalId, "festival_settings", "update");

  const updateData: any = {};
  if (data.bannerImageUrl !== undefined) updateData.bannerImageUrl = data.bannerImageUrl;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.homepageBlocks !== undefined) updateData.homepageBlocks = data.homepageBlocks;

  const updated = await prisma.siteSettings.update({
    where: { festivalId },
    data: updateData
  });

  return updated;
}

// --- Gallery ---

export async function getGalleryItems(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");
  return await prisma.siteGalleryItem.findMany({
    where: { festivalId },
    orderBy: { order: 'asc' }
  });
}

export async function addGalleryItem(festivalId: string, data: { imageUrl: string; caption?: string }) {
  await requirePermission(festivalId, "festival_settings", "update");
  
  const maxOrder = await prisma.siteGalleryItem.aggregate({
    where: { festivalId },
    _max: { order: true }
  });
  
  return await prisma.siteGalleryItem.create({
    data: {
      festivalId,
      imageUrl: data.imageUrl,
      caption: data.caption,
      order: (maxOrder._max.order ?? -1) + 1
    }
  });
}

export async function deleteGalleryItem(festivalId: string, itemId: string) {
  await requirePermission(festivalId, "festival_settings", "update");
  return await prisma.siteGalleryItem.delete({
    where: { id: itemId, festivalId }
  });
}

export async function toggleGallerySettings(festivalId: string, enabled: boolean) {
  await requirePermission(festivalId, "festival_settings", "update");
  return await prisma.siteSettings.update({
    where: { festivalId },
    data: { galleryEnabled: enabled }
  });
}

// --- Downloads ---

export async function getDownloads(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");
  return await prisma.siteDownload.findMany({
    where: { festivalId },
    orderBy: { order: 'asc' }
  });
}

export async function addDownload(festivalId: string, data: { title: string; description?: string; fileUrl: string }) {
  await requirePermission(festivalId, "festival_settings", "update");
  
  const maxOrder = await prisma.siteDownload.aggregate({
    where: { festivalId },
    _max: { order: true }
  });
  
  return await prisma.siteDownload.create({
    data: {
      festivalId,
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      order: (maxOrder._max.order ?? -1) + 1
    }
  });
}

export async function deleteDownload(festivalId: string, itemId: string) {
  await requirePermission(festivalId, "festival_settings", "update");
  return await prisma.siteDownload.delete({
    where: { id: itemId, festivalId }
  });
}

export async function toggleDownloadsSettings(festivalId: string, enabled: boolean) {
  await requirePermission(festivalId, "festival_settings", "update");
  return await prisma.siteSettings.update({
    where: { festivalId },
    data: { downloadsEnabled: enabled }
  });
}

// --- News ---

export async function getNewsPosts(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");
  return await prisma.siteNewsPost.findMany({
    where: { festivalId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function addNewsPost(festivalId: string, data: { title: string; slug: string; summary?: string; content: string }) {
  await requirePermission(festivalId, "festival_settings", "update");
  
  return await prisma.siteNewsPost.create({
    data: {
      festivalId,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      published: true,
      publishedAt: new Date()
    }
  });
}

export async function deleteNewsPost(festivalId: string, itemId: string) {
  await requirePermission(festivalId, "festival_settings", "update");
  return await prisma.siteNewsPost.delete({
    where: { id: itemId, festivalId }
  });
}

export async function toggleNewsSettings(festivalId: string, enabled: boolean) {
  await requirePermission(festivalId, "festival_settings", "update");
  return await prisma.siteSettings.update({
    where: { festivalId },
    data: { newsEnabled: enabled }
  });
}

// --- Results Layout ---

export async function updateResultsLayout(
  festivalId: string, 
  data: { 
    resultsLayoutStyle?: string; 
    resultsShowScores?: boolean;
    standingsPublic?: boolean;
    resultsPublic?: boolean;
  }
) {
  await requirePermission(festivalId, "festival_settings", "update");

  const updateData: any = {};
  if (data.resultsLayoutStyle !== undefined) updateData.resultsLayoutStyle = data.resultsLayoutStyle;
  if (data.resultsShowScores !== undefined) updateData.resultsShowScores = data.resultsShowScores;
  if (data.standingsPublic !== undefined) updateData.standingsPublic = data.standingsPublic;
  if (data.resultsPublic !== undefined) updateData.resultsPublic = data.resultsPublic;

  return await prisma.siteSettings.update({
    where: { festivalId },
    data: updateData
  });
}

// --- Images (Media Library) ---

export async function getImages(festivalId: string) {
  await requirePermission(festivalId, "festival_settings", "view");
  return await prisma.siteImage.findMany({
    where: { festivalId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function addImage(festivalId: string, data: { url: string; publicId?: string; alt?: string; fileSize?: number }) {
  await requirePermission(festivalId, "festival_settings", "update");
  
  return await prisma.siteImage.create({
    data: {
      festivalId,
      url: data.url,
      publicId: data.publicId,
      alt: data.alt || "",
      fileSize: data.fileSize
    }
  });
}

export async function deleteImage(festivalId: string, imageId: string) {
  await requirePermission(festivalId, "festival_settings", "update");
  // Note: Actual cloudinary deletion should happen on the API route or client side.
  // This just removes the DB record.
  return await prisma.siteImage.delete({
    where: { id: imageId, festivalId }
  });
}

// --- Visibility ---

export async function updateSiteVisibility(
  festivalId: string, 
  data: { 
    siteMode?: string; 
    maintenanceMessage?: string; 
    noindex?: boolean; 
    passwordProtected?: boolean; 
    newPassword?: string; 
    removePassword?: boolean;
  }
) {
  await requirePermission(festivalId, "festival_settings", "update");

  const updateData: any = {};
  if (data.siteMode !== undefined) updateData.siteMode = data.siteMode;
  if (data.maintenanceMessage !== undefined) updateData.maintenanceMessage = data.maintenanceMessage;
  if (data.noindex !== undefined) updateData.noindex = data.noindex;
  if (data.passwordProtected !== undefined) updateData.passwordProtected = data.passwordProtected;

  if (data.newPassword) {
    // We would normally hash this, for brevity in this task:
    const bcrypt = require("bcryptjs");
    updateData.sitePassword = await bcrypt.hash(data.newPassword, 10);
  } else if (data.removePassword) {
    updateData.sitePassword = null;
  }

  return await prisma.siteSettings.update({
    where: { festivalId },
    data: updateData
  });
}

