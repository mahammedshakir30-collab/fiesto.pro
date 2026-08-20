export type ImagePreset = "avatar" | "thumbnail" | "banner" | "poster" | "full";

export const PRESET_TRANSFORMATIONS: Record<ImagePreset, string> = {
  avatar: "w_200,h_200,c_thumb,g_face,f_auto,q_auto",
  thumbnail: "w_400,h_400,c_fill,f_auto,q_auto",
  banner: "w_1200,h_630,c_fill,f_auto,q_auto",
  poster: "w_800,c_limit,f_auto,q_auto",
  full: "f_auto,q_auto"
};

/**
 * Optimizes a Cloudinary image URL by injecting f_auto, q_auto and preset transformations.
 * If the URL is not hosted on Cloudinary, returns the URL as-is safely.
 * This helper is 100% safe to run in client bundles and edge runtimes.
 */
export function getOptimizedImageUrl(
  urlOrPublicId: string | null | undefined,
  preset: ImagePreset = "full",
  customTransform?: string
): string {
  if (!urlOrPublicId) return "";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "atrkd3bd";
  const transform = customTransform || PRESET_TRANSFORMATIONS[preset];

  // If already a full Cloudinary URL
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    if (urlOrPublicId.includes("/upload/")) {
      return urlOrPublicId.replace(/\/upload\/(?:[^\/]+\/)?/, `/upload/${transform}/`);
    }
    return urlOrPublicId;
  }

  // If it's a relative URL or other domain, return as-is
  if (urlOrPublicId.startsWith("http://") || urlOrPublicId.startsWith("https://") || urlOrPublicId.startsWith("/")) {
    return urlOrPublicId;
  }

  // Treat as Cloudinary publicId
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${urlOrPublicId}`;
}

/**
 * Optimizes a Cloudinary video URL with auto format and adaptive video quality.
 * Client-safe helper.
 */
export function getOptimizedVideoUrl(urlOrPublicId: string | null | undefined): string {
  if (!urlOrPublicId) return "";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "atrkd3bd";
  const videoTransform = "f_auto,q_auto,vc_auto";

  if (urlOrPublicId.includes("res.cloudinary.com")) {
    if (urlOrPublicId.includes("/upload/")) {
      return urlOrPublicId.replace(/\/upload\/(?:[^\/]+\/)?/, `/upload/${videoTransform}/`);
    }
    return urlOrPublicId;
  }

  if (urlOrPublicId.startsWith("http://") || urlOrPublicId.startsWith("https://") || urlOrPublicId.startsWith("/")) {
    return urlOrPublicId;
  }

  return `https://res.cloudinary.com/${cloudName}/video/upload/${videoTransform}/${urlOrPublicId}`;
}
