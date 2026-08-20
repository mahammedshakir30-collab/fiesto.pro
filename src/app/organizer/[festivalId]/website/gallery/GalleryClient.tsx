"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addGalleryItem, deleteGalleryItem, toggleGallerySettings } from "@/actions/website";
import { Image as ImageIcon, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GalleryClient({ festivalId, initialSettings, initialItems }: { festivalId: string; initialSettings: any; initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [enabled, setEnabled] = useState(initialSettings.galleryEnabled);
  const [savingSettings, setSavingSettings] = useState(false);

  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [adding, setAdding] = useState(false);

  const handleToggle = async (val: boolean) => {
    setEnabled(val);
    setSavingSettings(true);
    try {
      await toggleGallerySettings(festivalId, val);
      toast.success(val ? "Gallery enabled" : "Gallery disabled");
    } catch (e: any) {
      setEnabled(!val);
      toast.error(e.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setAdding(true);
    try {
      const item = await addGalleryItem(festivalId, { imageUrl: newUrl, caption: newCaption });
      setItems([...items, item]);
      setNewUrl("");
      setNewCaption("");
      toast.success("Image added to gallery");
    } catch (e: any) {
      toast.error(e.message || "Failed to add image");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryItem(festivalId, id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Image removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove image");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading mb-1">Public Gallery</h2>
          <p className="text-sm text-muted-foreground">Manage the photos displayed on your public festival site.</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <Label htmlFor="enable-gallery" className="font-bold text-sm">Enable Gallery Page</Label>
          <Switch id="enable-gallery" checked={enabled} onCheckedChange={handleToggle} disabled={savingSettings} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-base mb-4">Add New Image</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <Label className="text-xs mb-1 block">Image URL</Label>
            <div className="flex gap-2">
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." required />
              <Button type="button" variant="outline" className="shrink-0">Browse Files...</Button>
            </div>
          </div>
          <div className="flex-1">
            <Label className="text-xs mb-1 block">Caption (Optional)</Label>
            <Input value={newCaption} onChange={e => setNewCaption(e.target.value)} placeholder="Day 1 Main Stage..." />
          </div>
          <Button type="submit" disabled={adding || !newUrl} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white shrink-0">
            {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-dashed border-border rounded-2xl">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No images in gallery yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border bg-muted aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.caption || "Gallery image"} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {item.caption && (
                  <p className="text-white text-xs font-medium truncate">{item.caption}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
