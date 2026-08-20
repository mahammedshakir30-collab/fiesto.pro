"use client";

import { useState } from "react";
import { updateOrganizerVerification } from "@/actions/users";
import { CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";

export function OrganizerVerificationToggle({ organizerId, verified }: { organizerId: string, verified: boolean }) {
  const [loading, setLoading] = useState(false);

  const toggleVerification = async () => {
    setLoading(true);
    await updateOrganizerVerification(organizerId, !verified);
    window.location.reload();
  };

  return (
    <div className={`flex items-center justify-end gap-2 transition-soft ${loading ? "opacity-50" : "opacity-0 group-hover:opacity-100"}`}>
      <button 
        onClick={toggleVerification} 
        title={verified ? "Revoke Verification" : "Approve"} 
        className={`p-2 ${verified ? 'text-destructive hover:bg-destructive/10' : 'text-color-success hover:bg-color-success/10'} rounded-md`}
      >
        {verified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </button>
      <button className="p-2 text-muted-foreground hover:bg-muted rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
    </div>
  );
}
