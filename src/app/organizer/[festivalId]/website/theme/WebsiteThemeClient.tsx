"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import { updateSiteSettings } from "@/actions/website";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Type } from "lucide-react";

export function WebsiteThemeClient({ 
  festivalId, 
  initialSettings 
}: { 
  festivalId: string, 
  initialSettings: Prisma.SiteSettingsGetPayload<{}> 
}) {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(initialSettings.themeJson as any);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSiteSettings(festivalId, { themeJson: theme });
      alert("Theme saved.");
    } catch (err) {
      alert("Failed to save theme");
    }
    setLoading(false);
  };

  const updateThemeField = (field: string, value: string) => {
    setTheme({ ...theme, [field]: value });
  };

  return (
    <div className="max-w-6xl flex flex-col md:flex-row gap-6">
      
      {/* Settings Panel */}
      <div className="w-full md:w-80 flex-shrink-0 space-y-6">
        
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold font-heading text-lg mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-color-primary" />
            Colors
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Primary Color</label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={theme.primary || "#F1642E"} onChange={(e) => updateThemeField('primary', e.target.value)} />
                <Input className="flex-1 font-mono uppercase" value={theme.primary || "#F1642E"} onChange={(e) => updateThemeField('primary', e.target.value)} />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Secondary Color</label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={theme.secondary || "#504E76"} onChange={(e) => updateThemeField('secondary', e.target.value)} />
                <Input className="flex-1 font-mono uppercase" value={theme.secondary || "#504E76"} onChange={(e) => updateThemeField('secondary', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Background Color</label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={theme.background || "#FDF8E2"} onChange={(e) => updateThemeField('background', e.target.value)} />
                <Input className="flex-1 font-mono uppercase" value={theme.background || "#FDF8E2"} onChange={(e) => updateThemeField('background', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Text Color</label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={theme.text || "#1A1A1A"} onChange={(e) => updateThemeField('text', e.target.value)} />
                <Input className="flex-1 font-mono uppercase" value={theme.text || "#1A1A1A"} onChange={(e) => updateThemeField('text', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold font-heading text-lg mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-color-primary" />
            Typography
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Heading Font</label>
              <select 
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={theme.font || "Inter"}
                onChange={(e) => updateThemeField('font', e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Outfit">Outfit</option>
                <option value="Roboto">Roboto</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={loading} onClick={handleSave}>
          Save Theme
        </Button>

      </div>

      {/* Live Preview Pane */}
      <div className="flex-1 bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px] md:h-auto">
        <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Preview</div>
        </div>
        
        <div 
          className="flex-1 p-8 overflow-y-auto"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            fontFamily: theme.font
          }}
        >
          {/* Header Preview */}
          <header className="flex justify-between items-center mb-12 border-b pb-4 border-opacity-20 border-current">
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>Logo</div>
            <nav className="flex gap-6 text-sm font-medium opacity-80">
              <span>Home</span>
              <span>Schedule</span>
              <span>Tickets</span>
            </nav>
            <Button style={{ backgroundColor: theme.primary, color: '#fff', border: 'none' }}>Buy Tickets</Button>
          </header>

          {/* Hero Preview */}
          <div className="text-center py-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Your Festival Theme</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-80 mb-10">
              Customize the look and feel of your public site to match your brand identity perfectly.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" style={{ backgroundColor: theme.primary, color: '#fff', border: 'none' }}>Primary CTA</Button>
              <Button size="lg" variant="outline" style={{ borderColor: theme.secondary, color: theme.secondary }}>Secondary CTA</Button>
            </div>
          </div>

          {/* Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-xl p-6 border border-opacity-10 shadow-sm" style={{ backgroundColor: '#ffffff10' }}>
                <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white" style={{ backgroundColor: theme.secondary }}>
                  Icon
                </div>
                <h3 className="font-bold text-lg mb-2">Feature {i}</h3>
                <p className="opacity-70 text-sm">Preview how your cards and secondary elements look against the background.</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
