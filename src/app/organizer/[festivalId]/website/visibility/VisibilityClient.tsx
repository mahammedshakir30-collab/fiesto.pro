"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteVisibility } from "@/actions/website";
import { Globe, Lock, AlertTriangle, Search, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SITE_MODES = [
  { value: "LIVE", label: "Live", desc: "Site is publicly accessible", icon: Globe, color: "text-green-500 bg-green-50 border-green-200" },
  { value: "COMING_SOON", label: "Coming Soon", desc: "Show a teaser page before launch", icon: AlertTriangle, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { value: "MAINTENANCE", label: "Maintenance", desc: "Temporarily take the site offline", icon: AlertTriangle, color: "text-red-500 bg-red-50 border-red-200" },
];

export function VisibilityClient({ festivalId, initialSettings }: { festivalId: string; initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSiteVisibility(festivalId, {
        siteMode: settings.siteMode,
        maintenanceMessage: settings.maintenanceMessage,
        noindex: settings.noindex,
        passwordProtected: settings.passwordProtected,
        newPassword: settings.passwordProtected && newPassword ? newPassword : undefined,
        removePassword: !settings.passwordProtected,
      });
      setSaved(true);
      setNewPassword("");
      toast.success("Visibility settings saved.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold font-heading mb-1">Visibility</h2>
        <p className="text-sm text-muted-foreground">Control how the public sees your festival site.</p>
      </div>

      {/* Site Mode */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base">Site Mode</h3>
        <div className="grid gap-3">
          {SITE_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = settings.siteMode === mode.value;
            return (
              <button
                key={mode.value}
                onClick={() => setSettings((s: any) => ({ ...s, siteMode: mode.value }))}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isActive ? "border-[#504E76] bg-[#504E76]/5" : "border-border hover:border-[#504E76]/40"
                }`}
              >
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center border ${mode.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">{mode.label}</div>
                  <div className="text-xs text-muted-foreground">{mode.desc}</div>
                </div>
                {isActive && <div className="ml-auto mt-1 w-3 h-3 rounded-full bg-[#504E76]" />}
              </button>
            );
          })}
        </div>

        {settings.siteMode === "MAINTENANCE" && (
          <div className="mt-2">
            <Label className="text-sm font-bold">Maintenance Message</Label>
            <Textarea
              className="mt-1 resize-none"
              rows={3}
              placeholder="We'll be back shortly. Thanks for your patience!"
              value={settings.maintenanceMessage || ""}
              onChange={(e) => setSettings((s: any) => ({ ...s, maintenanceMessage: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Password Protection */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" /> Password Protection
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Require visitors to enter a password to view the site.</p>
          </div>
          <Switch
            checked={settings.passwordProtected}
            onCheckedChange={(v) => setSettings((s: any) => ({ ...s, passwordProtected: v }))}
          />
        </div>
        {settings.passwordProtected && (
          <div>
            <Label className="text-sm font-bold">
              {settings.sitePassword ? "Change Password" : "Set Password"}
            </Label>
            <Input
              type="password"
              className="mt-1 h-10"
              placeholder={settings.sitePassword ? "Enter new password to change…" : "Enter a site password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground mt-1">Leave blank to keep the current password.</p>
          </div>
        )}
      </div>

      {/* Search Engine Indexing */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" /> Block Search Engines
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a <code className="text-xs bg-muted px-1 rounded">noindex</code> tag to hide your site from Google, Bing, and other search engines.
            </p>
          </div>
          <Switch
            checked={settings.noindex}
            onCheckedChange={(v) => setSettings((s: any) => ({ ...s, noindex: v }))}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-[#504E76] hover:bg-[#504E76]/90 text-white rounded-xl px-8 h-11">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );
}
