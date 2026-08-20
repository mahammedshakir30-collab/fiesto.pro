"use client";

import { useState, useEffect } from "react";
import { resendVerificationEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";

export function ResendVerification() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cooldown > 0) return;

    setStatus("loading");
    try {
      await resendVerificationEmail(email);
      setStatus("success");
      setCooldown(60); // 60s cooldown
    } catch (err) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center p-4 bg-color-soft/20 rounded-xl border border-color-soft/50">
        <p className="text-sm font-bold text-color-primary flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" /> Email sent! Check your inbox.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          You can request another in {cooldown}s.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleResend} className="space-y-4">
      <div className="space-y-2 text-left">
        <label className="text-sm font-bold">Email Address</label>
        <Input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="your@email.com"
          className="h-12"
          required
        />
      </div>
      
      {status === "error" && (
        <p className="text-xs text-destructive text-center font-bold">Account already verified or email invalid.</p>
      )}

      <Button 
        type="submit" 
        variant="outline" 
        className="w-full h-12 rounded-xl font-bold"
        disabled={status === "loading" || cooldown > 0 || !email}
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : cooldown > 0 ? (
          `Resend available in ${cooldown}s`
        ) : (
          "Resend Verification Email"
        )}
      </Button>
    </form>
  );
}
