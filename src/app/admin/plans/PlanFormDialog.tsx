"use client";

import { useState, useEffect } from "react";
import { FEATURE_REGISTRY } from "@/lib/features";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash, GripVertical, Edit } from "lucide-react";
import { createPlanTier, updatePlanTier } from "@/actions/plans";
import { PlanCard, DurationOption, FeatureItem } from "@/components/shared/PlanCard";
import { PlanTier } from "@prisma/client";

interface PlanFormDialogProps {
  plan?: PlanTier;
  mode?: "create" | "edit";
}

export function PlanFormDialog({ plan, mode = "create" }: PlanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [badge, setBadge] = useState("");
  const [isContactSales, setIsContactSales] = useState(false);
  const [maxFestivals, setMaxFestivals] = useState<number | "">("");
  const [maxStaffPerFestival, setMaxStaffPerFestival] = useState<number | "">("");
  
  const [durationOptions, setDurationOptions] = useState<DurationOption[]>([
    { months: 1, pricePerMonth: 0, originalPricePerMonth: 0, totalPrice: 0, originalTotalPrice: 0 }
  ]);
  
  const [featureList, setFeatureList] = useState<FeatureItem[]>([]);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [entitlements, setEntitlements] = useState<Record<string, boolean>>({});

  // Sync state if editing
  useEffect(() => {
    if (open && plan && mode === "edit") {
      setName(plan.name);
      setTagline(plan.tagline || "");
      setBadge(plan.badge || "");
      setIsContactSales(plan.isContactSales);
      setMaxFestivals(plan.maxFestivals || "");
      setMaxStaffPerFestival(plan.maxStaffPerFestival || "");
      
      try {
        if (plan.durationOptions) {
          setDurationOptions(typeof plan.durationOptions === 'string' ? JSON.parse(plan.durationOptions) : plan.durationOptions as any);
        }
      } catch(e) {}
      
      try {
        if (plan.featureList) {
          setFeatureList(typeof plan.featureList === 'string' ? JSON.parse(plan.featureList) : plan.featureList as any);
        }
      } catch(e) {}

      setMonthlyPrice(plan.monthlyPrice);

      try {
        if (plan.featureEntitlements) {
          setEntitlements(typeof plan.featureEntitlements === 'string' ? JSON.parse(plan.featureEntitlements) : plan.featureEntitlements as any);
        }
      } catch(e) {}
    } else if (open && mode === "create") {
      // Reset for create
      setName("");
      setTagline("");
      setBadge("");
      setIsContactSales(false);
      setMaxFestivals("");
      setMaxStaffPerFestival("");
      setDurationOptions([{ months: 1, pricePerMonth: 0, originalPricePerMonth: 0, totalPrice: 0, originalTotalPrice: 0 }]);
      setFeatureList([]);
      setMonthlyPrice(0);
      setEntitlements({});
    }
  }, [open, plan, mode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("isContactSales", isContactSales.toString());
      formData.append("durationOptions", JSON.stringify(durationOptions));
      formData.append("featureList", JSON.stringify(featureList));
      
      const oneMonth = durationOptions.find(d => d.months === 1);
      formData.set("monthlyPrice", oneMonth ? oneMonth.pricePerMonth.toString() : monthlyPrice.toString());

      if (mode === "edit" && plan) {
        await updatePlanTier(plan.id, formData);
      } else {
        await createPlanTier(formData);
      }
      
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${mode} plan tier`);
    } finally {
      setLoading(false);
    }
  };

  const addDuration = () => {
    setDurationOptions([...durationOptions, { months: 3, pricePerMonth: 0, originalPricePerMonth: 0, totalPrice: 0, originalTotalPrice: 0 }]);
  };
  
  const removeDuration = (index: number) => {
    setDurationOptions(durationOptions.filter((_, i) => i !== index));
  };

  const updateDuration = (index: number, field: string, value: number) => {
    const updated = [...durationOptions];
    (updated[index] as any)[field] = value;
    
    if (field === 'months' || field === 'pricePerMonth') {
      updated[index].totalPrice = updated[index].months * updated[index].pricePerMonth;
    }
    
    setDurationOptions(updated);
  };

  const addFeature = () => {
    setFeatureList([...featureList, { label: "", value: "" }]);
  };

  const removeFeature = (index: number) => {
    setFeatureList(featureList.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const updated = [...featureList];
    (updated[index] as any)[field] = value;
    setFeatureList(updated);
  };

  const previewPlan: any = {
    id: plan?.id || "preview-id",
    name: name || "Plan Name",
    tagline,
    badge,
    isContactSales,
    durationOptions,
    featureList,
    monthlyPrice: durationOptions.find(d => d.months === 1)?.pricePerMonth || monthlyPrice
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <button className="flex-1 py-2 rounded-xl border border-border font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2">
             Edit
          </button>
        ) : (
          <button className="flex items-center gap-2 px-4 py-2 bg-color-primary text-white rounded-xl font-bold hover:bg-color-primary/90 transition-colors">
            <Plus className="w-5 h-5" /> Create Plan
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{mode === 'edit' ? 'Edit Plan Tier' : 'Create Plan Tier'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modify this subscription level.' : 'Define a new subscription level, its display card, and features.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 overflow-y-auto p-6 border-r custom-scrollbar">
            <form id="plan-form" onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Display Copy</h3>
                <div>
                  <label className="block text-sm font-bold mb-1">Plan Name</label>
                  <input 
                    name="name" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pro Tier"
                    className="w-full p-2.5 rounded-xl border border-border bg-background" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tagline</label>
                  <input 
                    name="tagline" 
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Best for growing festivals"
                    className="w-full p-2.5 rounded-xl border border-border bg-background" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Badge (Optional)</label>
                  <input 
                    name="badge" 
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. POPULAR"
                    className="w-full p-2.5 rounded-xl border border-border bg-background" 
                  />
                </div>
                
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50">
                  <input 
                    type="checkbox"
                    checked={isContactSales}
                    onChange={(e) => setIsContactSales(e.target.checked)}
                    className="w-4 h-4 accent-color-primary"
                  />
                  <div>
                    <div className="font-bold text-sm">Enterprise / Contact Sales Tier</div>
                    <div className="text-xs text-muted-foreground">Hides pricing entirely and routes CTA to "Contact sales"</div>
                  </div>
                </label>
              </div>

              {!isContactSales && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-lg">Pricing Durations</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addDuration}>
                      <Plus className="w-4 h-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  
                  {durationOptions.map((opt, i) => (
                    <div key={i} className="p-4 border rounded-xl bg-muted/20 relative group">
                      <button 
                        type="button"
                        onClick={() => removeDuration(i)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-xs font-bold mb-1 block">Months</label>
                          <input type="number" min="1" value={opt.months} onChange={(e) => updateDuration(i, 'months', parseInt(e.target.value))} className="w-full p-2 rounded-lg border text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold mb-1 block">Price / Month</label>
                          <input type="number" min="0" value={opt.pricePerMonth} onChange={(e) => updateDuration(i, 'pricePerMonth', parseInt(e.target.value))} className="w-full p-2 rounded-lg border text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold mb-1 block">Original Price / Month</label>
                          <input type="number" min="0" value={opt.originalPricePerMonth || 0} onChange={(e) => updateDuration(i, 'originalPricePerMonth', parseInt(e.target.value))} className="w-full p-2 rounded-lg border text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold mb-1 block">Total Price</label>
                          <input type="number" min="0" value={opt.totalPrice} onChange={(e) => updateDuration(i, 'totalPrice', parseInt(e.target.value))} className="w-full p-2 rounded-lg border text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <input type="hidden" name="monthlyPrice" value={monthlyPrice} />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-lg">Display Features</h3>
                  <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                    <Plus className="w-4 h-4 mr-1" /> Add Feature
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">This is the bulleted list shown on the card.</p>
                
                <div className="space-y-2">
                  {featureList.map((feat, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-move" />
                      <input 
                        placeholder="Label (e.g. Users)" 
                        value={feat.label} 
                        onChange={(e) => updateFeature(i, 'label', e.target.value)} 
                        className="flex-1 p-2 rounded-lg border text-sm" 
                      />
                      <input 
                        placeholder="Value (e.g. 10)" 
                        value={feat.value} 
                        onChange={(e) => updateFeature(i, 'value', e.target.value)} 
                        className="w-1/3 p-2 rounded-lg border text-sm" 
                      />
                      <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-red-500 p-2">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">System Entitlements</h3>
                <p className="text-xs text-muted-foreground mb-3">These actually lock/unlock functionality in the app.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Max Festivals</label>
                    <input type="number" name="maxFestivals" min="1" value={maxFestivals} onChange={e => setMaxFestivals(e.target.value ? parseInt(e.target.value) : "")} className="w-full p-2.5 rounded-xl border border-border bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Max Staff</label>
                    <input type="number" name="maxStaffPerFestival" min="1" value={maxStaffPerFestival} onChange={e => setMaxStaffPerFestival(e.target.value ? parseInt(e.target.value) : "")} className="w-full p-2.5 rounded-xl border border-border bg-background" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {FEATURE_REGISTRY.map(feature => (
                    <label key={feature.key} className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" name={`feature_${feature.key}`} checked={!!entitlements[feature.key]} onChange={e => setEntitlements({...entitlements, [feature.key]: e.target.checked})} className="mt-1 shrink-0 accent-color-primary" />
                      <div>
                        <div className="font-bold text-sm">{feature.label}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="w-1/2 bg-muted/30 p-8 flex flex-col items-center justify-center border-l relative overflow-y-auto custom-scrollbar">
            <h3 className="absolute top-6 left-8 font-bold text-muted-foreground uppercase tracking-widest text-xs">Live Preview</h3>
            
            <div className="w-full max-w-[350px]">
              <PlanCard 
                plan={previewPlan}
                context="public"
                selectedDuration={durationOptions.length > 0 ? durationOptions[0].months : 1}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-background">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="plan-form" disabled={loading} className="bg-color-primary text-white">
            {loading ? (mode === "edit" ? "Saving..." : "Creating...") : (mode === "edit" ? "Save Changes" : "Create Plan")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
