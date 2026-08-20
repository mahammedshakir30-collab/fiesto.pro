"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function uploadMediaAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "uploads";
  const resourceType = (formData.get("resourceType") as "image" | "video" | "auto") || "image";

  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await uploadToCloudinary(buffer, folder, resourceType);

  return {
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format
  };
}

// Backward compatibility helper
export async function getPresignedUrl(fileName: string, contentType: string, festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  // With Cloudinary, uploads can be executed directly via /api/upload
  return {
    presignedUrl: "/api/upload",
    publicUrl: `/uploads/${fileName}`
  };
}
