'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image, Wand2, Upload, LayoutTemplate, PlusCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { createTemplate } from "@/actions/templates";

const LAYOUTS = [
  'bold', 'minimal', 'photo_focus', 
  'achievement_spotlight', 'split_layout', 'full_bleed_gradient', 
  'framed_border', 'typographic', 'badge_center', 'banner_strip'
];

// Lightweight debounced search dropdown
function SearchSelect({ placeholder, value, onChange, fetchUrl, festivalId, filterKey, disabled = false }: any) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedObj, setSelectedObj] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let url = `${fetchUrl}?festivalId=${festivalId}&q=${encodeURIComponent(query)}`;
        if (filterKey) url += `&programmeId=${filterKey}`;
        const res = await fetch(url);
        if (res.ok) setResults(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open, fetchUrl, festivalId, filterKey]);

  return (
    <div className="relative" ref={ref}>
      <div 
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className="truncate">{selectedObj ? selectedObj.name : placeholder}</span>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md outline-none max-h-60 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-popover z-10 border-b">
            <Input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search..." 
              className="h-8"
              autoFocus
            />
          </div>
          <div className="p-1">
            <div 
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => { onChange(null); setSelectedObj(null); setOpen(false); }}
            >
              None
            </div>
            {loading ? (
              <div className="p-2 text-sm text-muted-foreground text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
            ) : results.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">No results found.</div>
            ) : results.map(item => (
              <div 
                key={item.id}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => { onChange(item.id); setSelectedObj(item); setOpen(false); }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CreatePosterModal({ festivalId, festivalData }: { festivalId: string, festivalData: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"auto" | "upload">("auto");
  
  // Basic
  const [name, setName] = useState("");
  const [layout, setLayout] = useState("bold");
  const [primary, setPrimary] = useState(festivalData?.primaryColor || "#000000");
  const [secondary, setSecondary] = useState(festivalData?.secondaryColor || "#ffffff");
  const [accent, setAccent] = useState(festivalData?.accentColor || "#ff0000");
  
  // Personalization
  const [programmeId, setProgrammeId] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [achievementLabel, setAchievementLabel] = useState("");
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  
  // Internal candidate details cache for tokens
  const [cachedCandidate, setCachedCandidate] = useState<any>(null);
  const [cachedProgramme, setCachedProgramme] = useState<any>(null);

  // Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [addTextOverlay, setAddTextOverlay] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch candidate/programme details when selected so tokens can resolve
  useEffect(() => {
    if (candidateId) {
      fetch(`/api/candidates/search?festivalId=${festivalId}&q=`).then(r => r.json()).then(data => {
        const c = data.find((x: any) => x.id === candidateId);
        if (c) setCachedCandidate(c);
      });
    } else {
      setCachedCandidate(null);
    }
  }, [candidateId, festivalId]);

  useEffect(() => {
    if (programmeId) {
      fetch(`/api/programmes/search?festivalId=${festivalId}&q=`).then(r => r.json()).then(data => {
        const p = data.find((x: any) => x.id === programmeId);
        if (p) setCachedProgramme(p);
      });
    } else {
      setCachedProgramme(null);
    }
  }, [programmeId, festivalId]);

  // Resolve tokens
  const resolveText = (text: string) => {
    let result = text;
    result = result.replace(/\{festival\.name\}/g, festivalData.name);
    if (cachedCandidate) {
      result = result.replace(/\{candidate\.name\}/g, cachedCandidate.name);
      result = result.replace(/\{team\.name\}/g, cachedCandidate.team?.name || '');
    }
    if (cachedProgramme) {
      result = result.replace(/\{programme\.name\}/g, cachedProgramme.name);
      result = result.replace(/\{programme\.category\}/g, cachedProgramme.category?.name || '');
    }
    return result;
  };

  const generatePreview = useCallback(() => {
    const params = new URLSearchParams({
      layout,
      primary,
      secondary,
      accent,
      title: festivalData.name,
      date: festivalData.startDate ? new Date(festivalData.startDate).toLocaleDateString() : "Coming Soon",
      achievementLabel,
      headline: resolveText(headline),
      message: resolveText(message)
    });
    
    if (festivalData.logoUrl) params.append("logo", festivalData.logoUrl);
    if (activeTab === 'upload' && uploadedFileUrl && addTextOverlay) {
      params.append("sourceImageUrl", uploadedFileUrl);
    }

    setPreviewUrl(`/api/templates/render?${params.toString()}`);
  }, [layout, primary, secondary, accent, festivalData, achievementLabel, headline, message, cachedCandidate, cachedProgramme, activeTab, uploadedFileUrl, addTextOverlay]);

  // Debounced live preview
  useEffect(() => {
    if (activeTab === 'auto' || (activeTab === 'upload' && addTextOverlay && uploadedFileUrl)) {
      const timer = setTimeout(() => generatePreview(), 400);
      return () => clearTimeout(timer);
    } else if (activeTab === 'upload' && uploadedFileUrl && !addTextOverlay) {
      setPreviewUrl(uploadedFileUrl);
    }
  }, [layout, primary, secondary, accent, achievementLabel, headline, message, cachedCandidate, cachedProgramme, activeTab, uploadedFileUrl, addTextOverlay, generatePreview]);

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setUploadedFileUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const insertToken = (setter: any, current: string, token: string) => {
    setter(current + (current.length > 0 && !current.endsWith(' ') ? ' ' : '') + token);
  };

  const TokenDropdown = ({ onSelect }: { onSelect: (token: string) => void }) => {
    const [tOpen, setTOpen] = useState(false);
    return (
      <div className="relative inline-block ml-2">
        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs border" onClick={() => setTOpen(!tOpen)}>
          <PlusCircle className="w-3 h-3 mr-1" /> Insert Field
        </Button>
        {tOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50 p-1 text-sm">
            <div className="px-2 py-1 cursor-pointer hover:bg-accent rounded-sm" onClick={() => { onSelect('{festival.name}'); setTOpen(false); }}>{`{festival.name}`}</div>
            {candidateId && <div className="px-2 py-1 cursor-pointer hover:bg-accent rounded-sm" onClick={() => { onSelect('{candidate.name}'); setTOpen(false); }}>{`{candidate.name}`}</div>}
            {candidateId && cachedCandidate?.team && <div className="px-2 py-1 cursor-pointer hover:bg-accent rounded-sm" onClick={() => { onSelect('{team.name}'); setTOpen(false); }}>{`{team.name}`}</div>}
            {programmeId && <div className="px-2 py-1 cursor-pointer hover:bg-accent rounded-sm" onClick={() => { onSelect('{programme.name}'); setTOpen(false); }}>{`{programme.name}`}</div>}
            {programmeId && <div className="px-2 py-1 cursor-pointer hover:bg-accent rounded-sm" onClick={() => { onSelect('{programme.category}'); setTOpen(false); }}>{`{programme.category}`}</div>}
          </div>
        )}
      </div>
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Please provide a name for the poster");
    if (!previewUrl && !uploadedFile) return toast.error("Generate a preview first");

    setLoading(true);
    try {
      await createTemplate(festivalId, {
        name,
        mode: activeTab === 'auto' ? "AUTO_GENERATED" : "UPLOADED",
        layoutKey: activeTab === 'auto' ? layout : null,
        colorTheme: { primary, secondary, accent },
        outputImageUrl: activeTab === 'auto' || addTextOverlay ? previewUrl : uploadedFileUrl,
        sourceImageUrl: activeTab === 'upload' ? uploadedFileUrl : null,
        programmeId,
        candidateId,
        achievementLabel,
        headline,
        message
      } as any);
      toast.success("Poster saved successfully!");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save poster");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Image className="w-4 h-4 mr-2" /> Create Poster</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>Create New Poster</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0 mt-2">
          <div className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 bg-muted p-1 rounded-md">
            <button onClick={() => setActiveTab("auto")} className={`flex items-center justify-center p-2 rounded-sm text-sm font-medium ${activeTab === "auto" ? "bg-background shadow-sm" : "text-muted-foreground"}`}><Wand2 className="w-4 h-4 mr-2" /> Auto-Generate</button>
            <button onClick={() => setActiveTab("upload")} className={`flex items-center justify-center p-2 rounded-sm text-sm font-medium ${activeTab === "upload" ? "bg-background shadow-sm" : "text-muted-foreground"}`}><Upload className="w-4 h-4 mr-2" /> Upload Design</button>
          </div>

          <div className="flex-1 flex gap-8 min-h-0">
            {/* Editor Sidebar */}
            <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar pb-10">
              
              <div className="space-y-2">
                <Label>Poster Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 1st Prize Winner - Solo Song" />
              </div>

              {activeTab === 'upload' && (
                <div className="space-y-4 border rounded-xl p-5 bg-muted/20">
                  <div className="space-y-2">
                    <Label>Upload Image (1080&times;1350 recommended)</Label>
                    <Input type="file" accept="image/png, image/jpeg" onChange={handleUploadFile} />
                    <p className="text-xs text-muted-foreground">Images will be cropped to fit a portrait aspect ratio.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="addText" checked={addTextOverlay} onChange={e => setAddTextOverlay(e.target.checked)} className="rounded border-gray-300" />
                    <Label htmlFor="addText" className="cursor-pointer">Add dynamic text overlay</Label>
                  </div>
                </div>
              )}

              {(activeTab === 'auto' || (activeTab === 'upload' && addTextOverlay)) && (
                <>
                  <div className="space-y-4 border rounded-xl p-5 bg-muted/20">
                    <h3 className="font-semibold text-sm">Personalization</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Programme (Optional)</Label>
                        <SearchSelect placeholder="Select Programme" fetchUrl="/api/programmes/search" festivalId={festivalId} onChange={setProgrammeId} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Candidate (Optional)</Label>
                        <SearchSelect placeholder="Select Candidate" fetchUrl="/api/candidates/search" festivalId={festivalId} filterKey={programmeId} disabled={!programmeId && candidateId === null /* just a UI hint, can select candidate without programme if needed */} onChange={setCandidateId} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Achievement Label (e.g. First Prize)</Label>
                      <Input value={achievementLabel} onChange={e => setAchievementLabel(e.target.value)} placeholder="Leave blank if none" />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-xl p-5 bg-muted/20">
                    <h3 className="font-semibold text-sm">Content</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <Label className="text-xs text-muted-foreground">Headline</Label>
                        <TokenDropdown onSelect={t => insertToken(setHeadline, headline, t)} />
                      </div>
                      <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. {programme.name} Winner!" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <Label className="text-xs text-muted-foreground">Message</Label>
                        <TokenDropdown onSelect={t => insertToken(setMessage, message, t)} />
                      </div>
                      <textarea 
                        value={message} onChange={e => setMessage(e.target.value)} 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Congratulations to {candidate.name}..."
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'auto' && (
                <>
                  <div className="space-y-4 border rounded-xl p-5 bg-muted/20">
                    <h3 className="font-semibold text-sm flex items-center"><LayoutTemplate className="w-4 h-4 mr-2"/> Layout Selection</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {LAYOUTS.map(l => (
                        <div 
                          key={l}
                          onClick={() => setLayout(l)}
                          className={`cursor-pointer border-2 rounded-lg aspect-[4/5] flex items-center justify-center text-[10px] font-medium capitalize text-center p-1 transition-all ${layout === l ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                        >
                          {l.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-xl p-5 bg-muted/20">
                    <h3 className="font-semibold text-sm">Brand Colors</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">Primary</Label>
                        <div className="flex gap-2"><Input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-8 h-8 p-0 border-0" /><Input value={primary} onChange={e => setPrimary(e.target.value)} className="h-8 text-xs font-mono" /></div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">Secondary</Label>
                        <div className="flex gap-2"><Input type="color" value={secondary} onChange={e => setSecondary(e.target.value)} className="w-8 h-8 p-0 border-0" /><Input value={secondary} onChange={e => setSecondary(e.target.value)} className="h-8 text-xs font-mono" /></div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">Accent</Label>
                        <div className="flex gap-2"><Input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-8 h-8 p-0 border-0" /><Input value={accent} onChange={e => setAccent(e.target.value)} className="h-8 text-xs font-mono" /></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Live Preview Pane */}
            <div className="w-1/2 border rounded-xl bg-accent/30 flex items-center justify-center flex-col overflow-hidden relative shadow-inner">
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm flex items-center text-muted-foreground z-10">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" /> Live Preview
              </div>
              
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="w-auto h-full max-h-[80vh] object-contain shadow-2xl transition-all duration-300 ease-in-out" />
              ) : (
                <div className="text-muted-foreground text-center p-8">
                  <Image className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Configure options to generate preview.</p>
                  <p className="text-xs mt-2 opacity-50">1080 &times; 1350px</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !previewUrl}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Save Poster to Gallery
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
