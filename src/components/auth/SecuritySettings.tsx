"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { changePassword } from "@/actions/auth";

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SecurityFormValues = z.infer<typeof securitySchema>;

export function SecuritySettings({ userId, hasPassword, email }: { userId: string, hasPassword: boolean, email?: string | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  });

  const onSubmit = async (data: SecurityFormValues) => {
    setStatus("loading");
    setServerError("");
    
    try {
      await changePassword(userId, data.currentPassword, data.newPassword);
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setServerError(err.message || "Failed to change password.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-color-accent" /> Security
        </h3>
        <p className="text-muted-foreground font-sans">Manage your password and connected accounts.</p>
      </div>

      <div className="p-6 bg-card border rounded-2xl space-y-6">
        <h4 className="font-bold text-lg">Connected Accounts</h4>
        {!hasPassword ? (
          <div className="flex items-center gap-4 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            <div>
              <div className="font-bold">Google Account</div>
              <div className="text-sm">Connected as {email || "Google"}. Password resets do not apply.</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-gray-50 text-gray-800 rounded-xl border">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center font-bold text-xs">@</div>
            <div>
              <div className="font-bold">{email || "Email & Password"}</div>
              <div className="text-sm">Standard login method.</div>
            </div>
          </div>
        )}
      </div>

      {hasPassword && (
        <div className="p-6 bg-card border rounded-2xl space-y-6">
          <h4 className="font-bold text-lg">Change Password</h4>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label className="font-bold">Current Password</Label>
              <Input type="password" {...register("currentPassword")} className={`h-12 ${errors.currentPassword ? 'border-destructive' : ''}`} />
              {errors.currentPassword && <p className="text-xs text-destructive font-bold">{errors.currentPassword.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">New Password</Label>
              <Input type="password" {...register("newPassword")} className={`h-12 ${errors.newPassword ? 'border-destructive' : ''}`} />
              {errors.newPassword && <p className="text-xs text-destructive font-bold">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Confirm New Password</Label>
              <Input type="password" {...register("confirmPassword")} className={`h-12 ${errors.confirmPassword ? 'border-destructive' : ''}`} />
              {errors.confirmPassword && <p className="text-xs text-destructive font-bold">{errors.confirmPassword.message}</p>}
            </div>

            {status === "error" && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm font-bold rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {serverError}
              </div>
            )}
            
            {status === "success" && (
              <div className="p-3 bg-color-success/10 text-color-success text-sm font-bold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Password updated successfully!
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-color-primary text-white rounded-xl font-bold mt-2"
              disabled={status === "loading"}
            >
              {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
