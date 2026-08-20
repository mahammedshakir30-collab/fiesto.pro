import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
export * from "./cloudinary-url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "atrkd3bd",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export { cloudinary };

/**
 * Shared server-side upload function for all FestOS media.
 * Enforces automatic format and quality negotiation.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string,
  resourceType: "image" | "video" | "auto" = "image",
  publicId?: string
): Promise<UploadApiResponse> {
  let fileSource: string;

  if (Buffer.isBuffer(file)) {
    const mimePrefix = resourceType === "video" ? "data:video/mp4;base64," : "data:image/png;base64,";
    fileSource = `${mimePrefix}${file.toString("base64")}`;
  } else {
    fileSource = file;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileSource,
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
        fetch_format: "auto",
        quality: "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      }
    );
  });
}
