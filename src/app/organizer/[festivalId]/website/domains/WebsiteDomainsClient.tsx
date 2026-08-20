"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import { updateSiteSettings, verifyCustomDomain } from "@/actions/website";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Globe, AlertCircle, CheckCircle2 } from "lucide-react";

export function WebsiteDomainsClient({ 
  festivalId, 
  initialSettings 
}: { 
  festivalId: string, 
  initialSettings: Prisma.SiteSettingsGetPayload<{}> 
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  
  const [subdomain, setSubdomain] = useState(settings.subdomain);
  const [customDomain, setCustomDomain] = useState(settings.customDomain || "");

  const handleSaveSubdomain = async () => {
    setLoading(true);
    try {
      const updated = await updateSiteSettings(festivalId, { subdomain });
      setSettings(updated as any);
      alert("Subdomain saved.");
    } catch (err: any) {
      alert("Failed to save subdomain. It might be taken.");
    }
    setLoading(false);
  };

  const handleVerifyCustomDomain = async () => {
    setLoading(true);
    try {
      const updated = await verifyCustomDomain(festivalId, customDomain);
      setSettings(updated as any);
    } catch (err) {
      alert("Failed to verify custom domain");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Subdomain */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold font-heading text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-color-primary" />
          FestOS Subdomain
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Your festival is always accessible via a free FestOS subdomain.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center border rounded-md px-3 bg-muted/30 w-full focus-within:ring-2 ring-color-primary/20">
            <span className="text-muted-foreground text-sm font-medium">http://localhost:3000/festivals/</span>
            <input 
              className="flex-1 bg-transparent border-none py-2 outline-none text-sm font-medium"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            />
          </div>
          <Button 
            className="w-full sm:w-auto" 
            disabled={loading || subdomain === settings.subdomain || !subdomain} 
            onClick={handleSaveSubdomain}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Custom Domain */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold font-heading text-lg">Custom Domain</h3>
          {settings.customDomain && (
            settings.customDomainVerified ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">
                <AlertCircle className="w-3 h-3" /> PENDING
              </span>
            )
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your own domain name to your public site (e.g., www.myfestival.com).
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input 
            placeholder="www.example.com" 
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
            disabled={settings.customDomainVerified}
          />
          {!settings.customDomainVerified ? (
            <Button 
              className="w-full sm:w-auto whitespace-nowrap"
              disabled={loading || !customDomain}
              onClick={handleVerifyCustomDomain}
            >
              Verify Domain
            </Button>
          ) : (
            <Button 
              variant="outline"
              className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={async () => {
                setLoading(true);
                const updated = await updateSiteSettings(festivalId, { customDomain: null, customDomainVerified: false });
                setSettings(updated as any);
                setCustomDomain("");
                setLoading(false);
              }}
              disabled={loading}
            >
              Remove
            </Button>
          )}
        </div>

        {/* DNS Instructions */}
        {settings.customDomain && !settings.customDomainVerified && (
          <div className="mt-6 bg-yellow-50/50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-yellow-800 mb-2">DNS Configuration Required</h4>
            <p className="text-sm text-yellow-700 mb-3">
              To verify ownership, add the following CNAME record to your domain's DNS settings.
            </p>
            <div className="grid grid-cols-12 gap-2 text-sm bg-white border rounded-lg p-3">
              <div className="col-span-3 font-semibold text-muted-foreground text-xs uppercase">Type</div>
              <div className="col-span-4 font-semibold text-muted-foreground text-xs uppercase">Name</div>
              <div className="col-span-5 font-semibold text-muted-foreground text-xs uppercase">Value</div>
              
              <div className="col-span-3 font-mono pt-1">CNAME</div>
              <div className="col-span-4 font-mono pt-1 truncate">{customDomain.startsWith('www.') ? 'www' : '@'}</div>
              <div className="col-span-5 font-mono pt-1 truncate flex items-center justify-between group">
                <span>cname.festos.io</span>
                <button 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  onClick={() => navigator.clipboard.writeText("cname.festos.io")}
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              DNS propagation can take up to 48 hours, but usually completes in a few minutes.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
