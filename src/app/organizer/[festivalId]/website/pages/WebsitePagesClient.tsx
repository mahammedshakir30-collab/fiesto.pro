"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import { updateSitePageOrder, togglePageVisibility, addCustomPage, deleteCustomPage } from "@/actions/website";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { GripVertical, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export function WebsitePagesClient({ 
  festivalId, 
  initialPages 
}: { 
  festivalId: string, 
  initialPages: Prisma.SitePageGetPayload<{}>[] 
}) {
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  const handleToggle = async (id: string, currentVisible: boolean) => {
    setLoading(true);
    try {
      await togglePageVisibility(festivalId, id, !currentVisible);
      setPages(pages.map(p => p.id === id ? { ...p, visible: !currentVisible } : p));
    } catch (err) {
      alert("Failed to update visibility");
    }
    setLoading(false);
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === pages.length - 1)) return;
    
    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
    
    setPages(newPages);
    
    // Persist
    setLoading(true);
    try {
      await updateSitePageOrder(festivalId, newPages.map(p => p.id));
    } catch (err) {
      alert("Failed to update order");
      setPages(pages); // revert on error
    }
    setLoading(false);
  };

  const handleAddPage = async () => {
    if (!newPageTitle || !newPageSlug) return;
    setLoading(true);
    try {
      const newPage = await addCustomPage(festivalId, newPageTitle, newPageSlug);
      setPages([...pages, newPage as any]);
      setNewPageTitle("");
      setNewPageSlug("");
    } catch (err) {
      alert("Failed to add page");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom page?")) return;
    setLoading(true);
    try {
      await deleteCustomPage(festivalId, id);
      setPages(pages.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete page");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading">Navigation Menu</h2>
          <p className="text-sm text-muted-foreground">Reorder pages to update your public site navigation. Hide pages you don't want to display.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <ul className="divide-y">
          {pages.map((page, index) => (
            <li key={page.id} className={`p-4 flex items-center justify-between transition-colors ${!page.visible ? 'bg-muted/30' : 'bg-transparent hover:bg-muted/10'}`}>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button 
                    disabled={index === 0 || loading} 
                    onClick={() => handleReorder(index, 'up')}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={index === pages.length - 1 || loading} 
                    onClick={() => handleReorder(index, 'down')}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${!page.visible && 'text-muted-foreground'}`}>{page.title}</span>
                    {page.isSystemPage && <span className="text-[10px] font-bold uppercase tracking-wider bg-color-secondary text-white px-1.5 py-0.5 rounded">System</span>}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">/{page.slug}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={page.visible} 
                    onCheckedChange={() => handleToggle(page.id, page.visible)}
                    disabled={loading}
                  />
                  <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                    {page.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                
                {!page.isSystemPage ? (
                  <button 
                    onClick={() => handleDelete(page.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50 p-2 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-8" /> // placeholder for alignment
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold font-heading text-lg mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-color-primary" />
          Add Custom Page
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Page Title</label>
            <Input 
              placeholder="e.g. FAQ" 
              value={newPageTitle}
              onChange={(e) => {
                setNewPageTitle(e.target.value);
                if (!newPageSlug || newPageSlug === newPageTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-')) {
                  setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">URL Slug</label>
            <div className="flex items-center border rounded-md px-3 bg-muted/30 focus-within:ring-2 ring-color-primary/20">
              <span className="text-muted-foreground text-sm font-medium">/</span>
              <input 
                className="flex-1 bg-transparent border-none py-2 outline-none text-sm font-medium ml-1"
                placeholder="faq"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
            </div>
          </div>
          <div className="sm:col-span-1 flex items-end">
            <Button 
              className="w-full" 
              disabled={loading || !newPageTitle || !newPageSlug}
              onClick={handleAddPage}
            >
              Add Page
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
