"use client";

import React, { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { CloudinaryImage } from '@/components/shared/CloudinaryImage';

export interface ImageUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  endpoint?: string;
  value?: string | null;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  onUpload, 
  folder = "uploads",
  endpoint,
  value,
  onRemove,
  className = "",
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      toast.error("Invalid image format. Supported: JPG, PNG, WebP, AVIF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      onUpload(data.url);
      toast.success("Image uploaded to Cloudinary");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/20 aspect-video max-h-48 group">
          <CloudinaryImage
            src={value}
            alt="Uploaded Image"
            preset="thumbnail"
            fill
            className="object-cover"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading || disabled}
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[120px] p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl hover:border-[#F1642E] hover:bg-[#FFF2ED]/30 transition-all bg-card cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-[#F1642E] animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground/60" />
          )}
          <span className="text-xs font-bold text-muted-foreground">
            {isUploading ? "Uploading to Cloudinary..." : "Click to Upload Image (Max 10MB)"}
          </span>
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
