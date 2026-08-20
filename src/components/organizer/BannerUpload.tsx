"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { getPresignedUrl } from "@/actions/upload";
import { updateFestivalBanner } from "@/actions/festivals";
import { toast } from "sonner";
import Image from "next/image";

interface BannerUploadProps {
  festivalId: string;
  currentUrl?: string | null;
}

export function BannerUpload({ festivalId, currentUrl }: BannerUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Invalid file type. Only JPG and PNG are allowed.");
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    // Validate dimensions (1920x1080)
    const img = document.createElement("img"); // Using document.createElement("img") instead of global Image because of Next.js 'Image' import collision
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(img.src);
      
      // Strict 1920x1080 or ratio validation (using 16:9 ratio check for flexibility, or exact)
      const is16by9 = Math.abs(img.width / img.height - 16 / 9) < 0.01;
      if (!is16by9 || img.width < 1920) {
        toast.error(`Image should be 16:9 ratio and at least 1920x1080. (Got ${img.width}x${img.height})`);
        return;
      }

      // Start upload process
      setIsUploading(true);
      try {
        const { presignedUrl, publicUrl } = await getPresignedUrl(file.name, file.type, festivalId);

        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload to S3");
        }

        // Update database
        await updateFestivalBanner(festivalId, publicUrl);
        
        setPreviewUrl(publicUrl);
        toast.success("Banner updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to upload banner");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Banner Image</label>
      <div 
        className="relative border-2 border-dashed border-border rounded-2xl h-48 flex flex-col items-center justify-center gap-3 hover:border-color-primary hover:bg-muted transition-soft cursor-pointer overflow-hidden"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">Uploading...</span>
          </div>
        ) : previewUrl ? (
          <>
            <Image src={previewUrl} alt="Banner Preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white font-medium">Change Image</span>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Upload 1920x1080 JPG/PNG</span>
          </>
        )}
      </div>
      <input 
        type="file" 
        accept="image/jpeg, image/png" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
