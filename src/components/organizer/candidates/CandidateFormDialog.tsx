"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Upload, User, X } from "lucide-react";
import { createCandidate, updateCandidate } from "@/actions/candidates";
import { CloudinaryImage } from "@/components/shared/CloudinaryImage";

interface CandidateFormDialogProps {
  festivalId: string;
  categories: { id: string; name: string }[];
  teams: { id: string; name: string }[];
  candidate?: any;
  trigger?: React.ReactNode;
}

export function CandidateFormDialog({ festivalId, categories, teams, candidate, trigger }: CandidateFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(candidate?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      alert("Invalid file type. JPG, PNG, and WebP are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `festivals/${festivalId}/candidate-photos`);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setPhotoUrl(data.url);
    } catch (error: any) {
      console.error("Upload error", error);
      alert(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (photoUrl) {
        formData.append("photoUrl", photoUrl);
      }
      
      if (candidate) {
        await updateCandidate(candidate.id, festivalId, formData);
      } else {
        await createCandidate(festivalId, formData);
      }
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-4 py-2 bg-color-primary text-white rounded-xl font-bold hover:bg-color-primary/90 transition-colors">
            <Plus className="w-5 h-5" /> Add Candidate
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle>{candidate ? "Edit Candidate" : "Create Candidate"}</DialogTitle>
          <DialogDescription>
            {candidate ? "Update the candidate details below." : "Register a new candidate for this festival."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border relative group">
              {photoUrl ? (
                <CloudinaryImage src={photoUrl} alt="Preview" preset="avatar" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
              
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
              </div>
            </div>
            {photoUrl && (
              <button 
                type="button" 
                onClick={() => setPhotoUrl(null)} 
                className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove Photo
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp, image/avif"
              onChange={handleFileChange} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Full Name</label>
            <input 
              name="name" 
              defaultValue={candidate?.name}
              required 
              placeholder="e.g. Jane Doe"
              className="w-full p-2.5 rounded-xl border border-border bg-background" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Category</label>
              <select 
                name="categoryId" 
                defaultValue={candidate?.category?.id}
                required
                className="w-full p-2.5 rounded-xl border border-border bg-background"
              >
                <option value="">Select...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Team <span className="font-normal text-muted-foreground">(Optional)</span></label>
              <select 
                name="teamId" 
                defaultValue={candidate?.team?.id || ""}
                className="w-full p-2.5 rounded-xl border border-border bg-background"
              >
                <option value="">None</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Chest Number <span className="font-normal text-muted-foreground">(Optional)</span></label>
              <input 
                name="chestNumber" 
                defaultValue={candidate?.chestNumber || ""}
                placeholder="e.g. 101"
                className="w-full p-2.5 rounded-xl border border-border bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Gender <span className="font-normal text-muted-foreground">(Optional)</span></label>
              <select 
                name="gender" 
                defaultValue={candidate?.gender || ""}
                className="w-full p-2.5 rounded-xl border border-border bg-background"
              >
                <option value="">Not Specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploading} className="bg-color-primary text-white hover:bg-color-primary/90">
              {loading ? "Saving..." : "Save Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
