"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { verifyEmailToken } from "@/actions/auth";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "invalid">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    verifyEmailToken(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("invalid"));
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-color-base flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-color-primary mb-4" />
        <p className="font-sans text-muted-foreground font-bold">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-color-base flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft text-center space-y-6 border border-border">
          <div className="w-20 h-20 bg-color-success text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-color-success/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-heading text-3xl font-bold">Email Verified!</h2>
          <p className="font-sans text-muted-foreground">
            Your email has been successfully verified. You can now sign in to your Fiesto account.
          </p>
          <Button asChild className="w-full h-12 bg-color-primary text-white hover:bg-color-primary/90 rounded-xl font-bold">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Invalid or expired status
  return (
    <div className="min-h-screen bg-color-base flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft text-center space-y-6 border border-border">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="font-heading text-3xl font-bold">Verification Failed</h2>
        <p className="font-sans text-muted-foreground">
          This verification link is invalid or has expired. Please request a new one.
        </p>
        
        <div className="pt-4 border-t border-dashed border-border">
          {/* <ResendVerification /> - Disabled per request */}
        </div>
      </div>
    </div>
  );
}
