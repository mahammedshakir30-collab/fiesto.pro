"use client";

import { useState } from "react";
import { updateFestivalPlan } from "@/actions/plans";
import { Button } from "@/components/ui/button";

export function UpdateFestivalPlanForm({ festivalId, currentPlanId, currentTrialEndsAt, plans }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateFestivalPlan(formData);
      alert("Plan updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = currentTrialEndsAt ? new Date(currentTrialEndsAt).toISOString().split('T')[0] : "";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-3 mt-4 p-4 border border-border rounded-xl bg-muted/20">
      <input type="hidden" name="festivalId" value={festivalId} />
      
      <div className="flex-1 w-full">
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Plan Tier</label>
        <select 
          name="planTierId" 
          defaultValue={currentPlanId || "none"}
          className="w-full p-2 rounded-lg border border-border bg-background"
        >
          <option value="none">No Plan</option>
          {plans.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} (${p.monthlyPrice}/mo)</option>
          ))}
        </select>
      </div>

      <div className="flex-1 w-full">
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Plan Validity / Trial End Date</label>
        <input 
          type="date" 
          name="trialEndsAt" 
          defaultValue={formattedDate}
          className="w-full p-2 rounded-lg border border-border bg-background"
        />
      </div>

      <Button type="submit" disabled={loading} className="bg-color-primary text-white hover:bg-color-primary/90">
        {loading ? "Updating..." : "Update Plan"}
      </Button>
    </form>
  );
}
