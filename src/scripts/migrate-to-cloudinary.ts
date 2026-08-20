import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "atrkd3bd",
  api_key: process.env.CLOUDINARY_API_KEY || "331319356187115",
  api_secret: process.env.CLOUDINARY_API_SECRET || "9EZrLM_nC-LXWk5oTXv_NT90oh8",
  secure: true
});

async function migrateAsset(url: string, folder: string, resourceType: "image" | "video" = "image"): Promise<string | null> {
  if (!url) return null;
  if (url.includes("res.cloudinary.com")) {
    console.log(`  [Skip] Already on Cloudinary: ${url}`);
    return url;
  }

  try {
    console.log(`  [Migrating] ${url} -> Cloudinary folder: ${folder}...`);
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: resourceType,
      fetch_format: "auto",
      quality: "auto"
    });
    console.log(`  [Success] New Cloudinary URL: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  [Error] Failed to migrate asset ${url}:`, err);
    return null;
  }
}

export async function runMigration() {
  console.log("=== FestOS Cloudinary Asset Migration ===");
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || "atrkd3bd"}\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  // 1. Migrate Candidate Photos
  console.log("1. Checking Candidates...");
  const candidates = await prisma.candidate.findMany({
    where: { photoUrl: { not: null } },
    include: { team: true }
  });

  for (const c of candidates) {
    if (c.photoUrl) {
      if (c.photoUrl.includes("res.cloudinary.com")) {
        skippedCount++;
      } else {
        const newUrl = await migrateAsset(
          c.photoUrl,
          `festivals/${c.team?.festivalId || "general"}/candidate-photos`
        );
        if (newUrl) {
          await prisma.candidate.update({
            where: { id: c.id },
            data: { photoUrl: newUrl }
          });
          migratedCount++;
        }
      }
    }
  }

  // 2. Migrate Festival Banners
  console.log("\n2. Checking Festivals...");
  const festivals = await prisma.festival.findMany({
    where: {
      coverImageUrl: { not: null }
    }
  });

  for (const f of festivals) {
    if (f.coverImageUrl && !f.coverImageUrl.includes("res.cloudinary.com")) {
      const newCover = await migrateAsset(f.coverImageUrl, `festivals/${f.id}/branding`);
      if (newCover) {
        await prisma.festival.update({
          where: { id: f.id },
          data: { coverImageUrl: newCover }
        });
        migratedCount++;
      }
    }
  }

  // 3. Migrate Vendor Profiles
  console.log("\n3. Checking Vendor Profiles...");
  const vendorProfiles = await prisma.vendorProfile.findMany();

  for (const vp of vendorProfiles) {
    let needsUpdate = false;
    let newLogo = vp.logoUrl;
    const rawPhotos = Array.isArray(vp.boothPhotos) ? (vp.boothPhotos as string[]) : [];
    let newPhotos = [...rawPhotos];

    if (vp.logoUrl && !vp.logoUrl.includes("res.cloudinary.com")) {
      const uploadedLogo = await migrateAsset(vp.logoUrl, `festivals/vendors/logos`);
      if (uploadedLogo) {
        newLogo = uploadedLogo;
        needsUpdate = true;
        migratedCount++;
      }
    }

    for (let i = 0; i < newPhotos.length; i++) {
      if (newPhotos[i] && !newPhotos[i].includes("res.cloudinary.com")) {
        const uploadedPhoto = await migrateAsset(newPhotos[i], `festivals/vendors/booth-photos`);
        if (uploadedPhoto) {
          newPhotos[i] = uploadedPhoto;
          needsUpdate = true;
          migratedCount++;
        }
      }
    }

    if (needsUpdate) {
      await prisma.vendorProfile.update({
        where: { id: vp.id },
        data: {
          logoUrl: newLogo,
          boothPhotos: newPhotos
        }
      });
    }
  }

  // 4. Migrate Dashboard Setup Video
  console.log("\n4. Checking Dashboard Setup Video...");
  const videos = await prisma.dashboardSetupVideo.findMany({
    where: { fileUrl: { not: null } }
  });

  for (const v of videos) {
    if (v.fileUrl && !v.fileUrl.includes("res.cloudinary.com")) {
      const newVideo = await migrateAsset(v.fileUrl, `platform/dashboard-setup-video`, "video");
      if (newVideo) {
        await prisma.dashboardSetupVideo.update({
          where: { id: v.id },
          data: { fileUrl: newVideo }
        });
        migratedCount++;
      }
    }
  }

  console.log("\n=== Migration Completed ===");
  console.log(`Total Assets Migrated: ${migratedCount}`);
  console.log(`Already on Cloudinary / Skipped: ${skippedCount}`);
}

runMigration()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
