"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addImage, deleteImage } from "@/actions/website";
import { Image as ImageIcon, Trash2, Plus, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export function ImagesClient({ festivalId, initialItems }: { festivalId: string; initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setAdding(true);
    try {
      const item = await addImage(festivalId, { url: newUrl });
      setItems([item, ...items]);
      setNewUrl("");
      toast.success("Image added to library");
    } catch (e: any) {
      toast.error(e.message || "Failed to add image");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(festivalId, id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Image removed from library");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove image");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-bold font-heading mb-1">Image Library</h2>
        <p className="text-sm text-muted-foreground">Manage all media assets used across your festival site (logos, banners, blocks).</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-muted-foreground" />
          Add Image
        </h3>
        
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Paste image URL here..." required />
              <Button type="button" variant="outline" className="shrink-0" onClick={() => toast.info("Cloudinary direct upload UI coming soon!")}>
                Upload File...
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={adding || !newUrl} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white shrink-0">
            {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Save to Library
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-dashed border-border rounded-2xl">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No images uploaded yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border bg-muted aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt || "Library image"} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    toast.success("URL copied to clipboard");
                  }} className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-colors text-xs font-medium">
                    Copy URL
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
