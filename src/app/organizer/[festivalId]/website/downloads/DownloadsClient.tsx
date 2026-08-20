"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDownload, deleteDownload, toggleDownloadsSettings } from "@/actions/website";
import { FileDown, Trash2, Plus, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function DownloadsClient({ festivalId, initialSettings, initialItems }: { festivalId: string; initialSettings: any; initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [enabled, setEnabled] = useState(initialSettings.downloadsEnabled);
  const [savingSettings, setSavingSettings] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const handleToggle = async (val: boolean) => {
    setEnabled(val);
    setSavingSettings(true);
    try {
      await toggleDownloadsSettings(festivalId, val);
      toast.success(val ? "Downloads enabled" : "Downloads disabled");
    } catch (e: any) {
      setEnabled(!val);
      toast.error(e.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;
    setAdding(true);
    try {
      const item = await addDownload(festivalId, { title, description: desc, fileUrl: url });
      setItems([...items, item]);
      setTitle("");
      setDesc("");
      setUrl("");
      toast.success("Download added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add download");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDownload(festivalId, id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Download removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove download");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading mb-1">Public Downloads</h2>
          <p className="text-sm text-muted-foreground">Manage files (rulebooks, maps, forms) available for public download.</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <Label htmlFor="enable-downloads" className="font-bold text-sm">Enable Downloads Page</Label>
          <Switch id="enable-downloads" checked={enabled} onCheckedChange={handleToggle} disabled={savingSettings} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-base mb-4">Add New File</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label className="text-xs mb-1 block">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Festival Rulebook 2026" required />
          </div>
          <div>
            <Label className="text-xs mb-1 block">File URL</Label>
            <div className="flex gap-2">
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." required />
              <Button type="button" variant="outline" className="shrink-0">Browse...</Button>
            </div>
          </div>
          <div className="md:col-span-2 flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Description (Optional)</Label>
              <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="A brief description of this file..." />
            </div>
            <Button type="submit" disabled={adding || !url || !title} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white shrink-0">
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add File
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-card border border-dashed border-border rounded-2xl">
            <FileDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No downloads added yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-xl text-[#504E76]">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">{item.title}</h4>
                  {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
