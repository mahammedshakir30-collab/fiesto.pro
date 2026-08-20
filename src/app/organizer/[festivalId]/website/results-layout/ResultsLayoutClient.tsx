"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateResultsLayout } from "@/actions/website";
import { Loader2, CheckCircle2, Trophy, Eye, EyeOff, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

export function ResultsLayoutClient({ festivalId, initialSettings }: { festivalId: string; initialSettings: any }) {
  const [settings, setSettings] = useState({
    resultsLayoutStyle: initialSettings.resultsLayoutStyle || "TABLE",
    resultsShowScores: initialSettings.resultsShowScores || false,
    standingsPublic: initialSettings.standingsPublic !== false, // default true
    resultsPublic: initialSettings.resultsPublic !== false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateResultsLayout(festivalId, settings);
      setSaved(true);
      toast.success("Results layout saved.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold font-heading mb-1">Results Layout & Visibility</h2>
        <p className="text-sm text-muted-foreground">Control how results and standings are displayed to the public.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#F1642E]" /> Global Toggles
        </h3>
        
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <Label className="font-bold text-sm block mb-1">Make Program Results Public</Label>
            <p className="text-xs text-muted-foreground">If disabled, individual competition results are hidden from the public site.</p>
          </div>
          <Switch 
            checked={settings.resultsPublic} 
            onCheckedChange={(v) => setSettings(s => ({ ...s, resultsPublic: v }))} 
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label className="font-bold text-sm block mb-1">Make Team Standings Public</Label>
            <p className="text-xs text-muted-foreground">If disabled, the overall team leaderboard is hidden from the public site.</p>
          </div>
          <Switch 
            checked={settings.standingsPublic} 
            onCheckedChange={(v) => setSettings(s => ({ ...s, standingsPublic: v }))} 
          />
        </div>
      </div>

      {settings.resultsPublic && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-base flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#504E76]" /> Program Results Display
          </h3>
          
          <div className="space-y-3">
            <Label className="font-bold text-sm block">Display Style</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSettings(s => ({ ...s, resultsLayoutStyle: "TABLE" }))}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  settings.resultsLayoutStyle === "TABLE" ? "border-[#504E76] bg-[#504E76]/5" : "border-border hover:border-[#504E76]/40"
                }`}
              >
                <List className="w-6 h-6 mb-2 text-muted-foreground" />
                <div className="font-bold text-sm">Table View</div>
                <div className="text-xs text-muted-foreground mt-1">Compact list showing rank, chest number, and name.</div>
              </button>
              <button
                onClick={() => setSettings(s => ({ ...s, resultsLayoutStyle: "PODIUM" }))}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  settings.resultsLayoutStyle === "PODIUM" ? "border-[#504E76] bg-[#504E76]/5" : "border-border hover:border-[#504E76]/40"
                }`}
              >
                <Trophy className="w-6 h-6 mb-2 text-muted-foreground" />
                <div className="font-bold text-sm">Podium View</div>
                <div className="text-xs text-muted-foreground mt-1">Visual 1st/2nd/3rd place blocks (best for public).</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-border mt-4">
            <div>
              <Label className="font-bold text-sm block mb-1">Show Exact Scores</Label>
              <p className="text-xs text-muted-foreground">If disabled, only ranks (1st, 2nd, etc.) are shown without raw scores.</p>
            </div>
            <Switch 
              checked={settings.resultsShowScores} 
              onCheckedChange={(v) => setSettings(s => ({ ...s, resultsShowScores: v }))} 
            />
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white rounded-xl px-8 h-11">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );
}
