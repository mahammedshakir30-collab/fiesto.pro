"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addNewsPost, deleteNewsPost, toggleNewsSettings } from "@/actions/website";
import { Newspaper, Trash2, Plus, Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";

export function NewsClient({ festivalId, initialSettings, initialItems }: { festivalId: string; initialSettings: any; initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [enabled, setEnabled] = useState(initialSettings.newsEnabled);
  const [savingSettings, setSavingSettings] = useState(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleToggle = async (val: boolean) => {
    setEnabled(val);
    setSavingSettings(true);
    try {
      await toggleNewsSettings(festivalId, val);
      toast.success(val ? "News enabled" : "News disabled");
    } catch (e: any) {
      setEnabled(!val);
      toast.error(e.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setAdding(true);
    try {
      const slug = generateSlug(title);
      const item = await addNewsPost(festivalId, { title, slug, summary, content });
      setItems([item, ...items]);
      setTitle("");
      setSummary("");
      setContent("");
      toast.success("News post published");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish post");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNewsPost(festivalId, id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Post removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove post");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading mb-1">Public News & Announcements</h2>
          <p className="text-sm text-muted-foreground">Publish updates and stories to your festival site.</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <Label htmlFor="enable-news" className="font-bold text-sm">Enable News Page</Label>
          <Switch id="enable-news" checked={enabled} onCheckedChange={handleToggle} disabled={savingSettings} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-base mb-4">Write a New Post</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label className="text-xs mb-1 block">Post Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Schedule Announced!" required />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Short Summary</Label>
            <Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="A brief sentence describing this post..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Content</Label>
            <Textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Write your news content here..." 
              className="min-h-[150px] resize-y"
              required 
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={adding || !title || !content} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white">
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              Publish Post
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-card border border-dashed border-border rounded-2xl">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No news posts published yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-5 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Published {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {item.summary && <p className="text-sm font-medium mt-3">{item.summary}</p>}
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.content}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
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
