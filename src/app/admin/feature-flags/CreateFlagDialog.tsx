"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createGlobalFlag } from "@/actions/feature-flags";

export function CreateFlagDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createGlobalFlag(formData);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create feature flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-color-primary text-white rounded-xl font-bold hover:bg-color-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Add Flag
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
          <DialogDescription>
            Add a new global kill switch. The key will be automatically formatted to UPPER_SNAKE_CASE.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-1">Flag Key</label>
            <input 
              name="key" 
              required 
              placeholder="e.g. BETA_DASHBOARD"
              className="w-full p-2.5 rounded-xl border border-border bg-background uppercase" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description <span className="font-normal text-muted-foreground">(Optional)</span></label>
            <textarea 
              name="description" 
              rows={3}
              placeholder="What does this flag control?"
              className="w-full p-2.5 rounded-xl border border-border bg-background resize-none" 
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              name="enabled" 
              value="true"
              id="flag-enabled"
              className="w-4 h-4 accent-color-primary"
            />
            <label htmlFor="flag-enabled" className="text-sm font-medium cursor-pointer">
              Enable immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-color-primary text-white hover:bg-color-primary/90">
              {loading ? "Creating..." : "Create Flag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
