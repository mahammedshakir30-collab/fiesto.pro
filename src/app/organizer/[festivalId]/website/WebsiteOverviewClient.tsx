"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import { updateSiteSettings } from "@/actions/website";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ExternalLink, Lock, Globe } from "lucide-react";

export function WebsiteOverviewClient({ 
  festivalId, 
  initialSettings 
}: { 
  festivalId: string, 
  initialSettings: Prisma.SiteSettingsGetPayload<{}> 
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState(settings.sitePassword || "");

  const handleUpdate = async (data: Partial<Prisma.SiteSettingsUpdateInput>) => {
    setLoading(true);
    try {
      const updated = await updateSiteSettings(festivalId, data);
      setSettings(updated as any);
    } catch (err) {
      alert("Failed to update settings");
    }
    setLoading(false);
  };

  const publicUrl = settings.customDomainVerified && settings.customDomain
    ? `https://${settings.customDomain}`
    : `http://localhost:3000/festivals/${settings.subdomain}`;

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-heading text-lg">Site Status</h3>
            <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${settings.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {settings.published ? "Live" : "Draft"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {settings.published 
              ? "Your site is live and accessible to the public." 
              : "Your site is currently in draft mode. Visitors will see a 'Coming Soon' placeholder."}
          </p>
          <div className="mt-auto pt-4 border-t flex items-center justify-between">
            <Button 
              variant={settings.published ? "outline" : "default"} 
              onClick={() => handleUpdate({ published: !settings.published })}
              disabled={loading}
            >
              {settings.published ? "Unpublish Site" : "Publish Site"}
            </Button>
            <Button variant="ghost" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                View Live <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Protection Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-color-primary" />
            <h3 className="font-bold font-heading text-lg">Password Protection</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Require visitors to enter a password before viewing any page on your site.
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-medium text-sm">Enable Protection</span>
            <Switch 
              checked={settings.passwordProtected} 
              onCheckedChange={(c: boolean) => handleUpdate({ passwordProtected: c })}
              disabled={loading}
            />
          </div>
          {settings.passwordProtected && (
            <div className="mt-auto pt-4 border-t flex items-center gap-2">
              <Input 
                type="text" 
                placeholder="Enter password..." 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => handleUpdate({ sitePassword: passwordInput })}
                disabled={loading || passwordInput === settings.sitePassword}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Frame Mock */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="mx-auto bg-background px-4 py-1 rounded-md text-xs text-muted-foreground flex items-center gap-2">
            <Globe className="w-3 h-3" /> {publicUrl}
          </div>
        </div>
        <div className="h-[400px] w-full bg-muted/30 relative flex items-center justify-center">
          {/* Iframe to the actual site - appending a query param to bypass cache if needed */}
          <iframe 
            src={`${publicUrl}?preview=true`} 
            className="w-full h-full border-none pointer-events-none opacity-90"
            title="Site Preview"
          />
        </div>
      </div>

    </div>
  );
}
