"use client";

import { useState, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateHomepageContent } from "@/actions/website";
import { Image as ImageIcon, GripVertical, Loader2, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ui/image-cropper";

// Default blocks
const DEFAULT_BLOCKS = [
  { id: "intro", title: "Introduction Text", visible: true },
  { id: "schedule", title: "Event Schedule", visible: true },
  { id: "news", title: "Latest News", visible: true },
  { id: "gallery", title: "Photo Gallery", visible: true },
  { id: "downloads", title: "Downloads", visible: true },
  { id: "sponsors", title: "Sponsors & Partners", visible: true },
];

export function HomepageContentClient({ festivalId, initialSettings }: { festivalId: string; initialSettings: any }) {
  const [bannerUrl, setBannerUrl] = useState(initialSettings.bannerImageUrl || "");
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  
  // Parse blocks or use defaults
  const [blocks, setBlocks] = useState(() => {
    try {
      const parsed = typeof initialSettings.homepageBlocks === "string" 
        ? JSON.parse(initialSettings.homepageBlocks) 
        : initialSettings.homepageBlocks;
        
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
    return DEFAULT_BLOCKS;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperAspect, setCropperAspect] = useState(16/9);
  const [cropperTarget, setCropperTarget] = useState<"banner"|"logo">("banner");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const toggleBlock = (id: string, visible: boolean) => {
    setBlocks(blocks.map((b: any) => b.id === id ? { ...b, visible } : b));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    setBlocks(newBlocks);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: "banner"|"logo") => {
    if (e.target.files && e.target.files.length > 0) {
      setCropperFile(e.target.files[0]);
      setCropperAspect(target === "banner" ? 16 / 9 : 1 / 1);
      setCropperTarget(target);
      setCropperOpen(true);
    }
    // reset input so same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = async (blob: Blob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");
      formData.append("folder", `festival_${festivalId}/website`);
      formData.append("resourceType", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (cropperTarget === "banner") {
        setBannerUrl(data.url);
      } else {
        setLogoUrl(data.url);
      }
      toast.success("Uploaded successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to upload image");
    } finally {
      setUploading(false);
      setCropperOpen(false);
      setCropperFile(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateHomepageContent(festivalId, {
        bannerImageUrl: bannerUrl,
        logoUrl: logoUrl,
        homepageBlocks: blocks
      });
      setSaved(true);
      toast.success("Homepage content saved.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold font-heading mb-1">Homepage Content</h2>
        <p className="text-sm text-muted-foreground">Manage the layout and main imagery of your festival's landing page.</p>
      </div>

      {/* Hero Banner & Logo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-base">Hero Banner Image</h3>
          </div>
          <div>
            <Label className="text-sm font-bold">Image URL</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={bannerUrl} 
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/hero.jpg"
                className="flex-1"
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={bannerInputRef} 
                onChange={(e) => handleFileSelect(e, "banner")}
              />
              <Button variant="outline" onClick={() => bannerInputRef.current?.click()} disabled={uploading}>
                 {uploading && cropperTarget === 'banner' ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Upload className="w-4 h-4 mr-2" />}
                 Upload
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Recommended size: 1920x1080px (16:9).
            </p>
          </div>
          {bannerUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-video bg-muted relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-base">Festival Logo</h3>
          </div>
          <div>
            <Label className="text-sm font-bold">Image URL</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.jpg"
                className="flex-1"
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={logoInputRef} 
                onChange={(e) => handleFileSelect(e, "logo")}
              />
              <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploading}>
                 {uploading && cropperTarget === 'logo' ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Upload className="w-4 h-4 mr-2" />}
                 Upload
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Recommended size: 500x500px (1:1).
            </p>
          </div>
          {logoUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-square bg-muted relative w-32 h-32 mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
      </div>

      {/* Content Blocks */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base">Homepage Sections</h3>
        <p className="text-sm text-muted-foreground">Toggle sections on or off, and use the arrows to reorder them on your landing page.</p>
        
        <div className="space-y-2 mt-4">
          {blocks.map((block: any, i: number) => (
            <div key={block.id} className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => moveBlock(i, -1)} 
                  disabled={i === 0}
                  className="p-1 hover:bg-muted rounded disabled:opacity-30"
                >
                   
                </button>
                <button 
                  onClick={() => moveBlock(i, 1)} 
                  disabled={i === blocks.length - 1}
                  className="p-1 hover:bg-muted rounded disabled:opacity-30"
                >
                   
                </button>
              </div>
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab opacity-50" />
              <div className="flex-1 font-medium">{block.title}</div>
              <Switch 
                checked={block.visible} 
                onCheckedChange={(v) => toggleBlock(block.id, v)} 
              />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white rounded-xl px-8 h-11">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>

      <ImageCropper
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageFile={cropperFile}
        aspectRatio={cropperAspect}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
