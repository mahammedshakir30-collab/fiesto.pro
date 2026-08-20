"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateResetToken, resetPassword } from "@/actions/auth";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "success">("loading");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    validateResetToken(token)
      .then(() => setStatus("valid"))
      .catch(() => setStatus("invalid"));
  }, [token]);

  const onSubmit = async (data: ResetFormValues) => {
    setServerError("");
    try {
      await resetPassword(token as string, data.password);
      setStatus("success");
    } catch (err: any) {
      setServerError(err.message || "Failed to reset password.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-color-base flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-color-primary" />
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
          <h2 className="font-heading text-3xl font-bold">Password Reset!</h2>
          <p className="font-sans text-muted-foreground">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <Button asChild className="w-full h-12 bg-color-primary text-white rounded-xl font-bold">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-color-base flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft text-center space-y-6 border border-border">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="font-heading text-3xl font-bold">Invalid Link</h2>
          <p className="font-sans text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
          <Button asChild className="w-full h-12 bg-color-primary text-white rounded-xl font-bold">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-base flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-border relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-color-accent" />

        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-color-primary">Create New Password</h1>
          <p className="font-sans text-muted-foreground mt-2">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              {...register("password")}
              className={`h-12 bg-gray-50 focus:bg-white ${errors.password ? 'border-destructive' : ''}`}
            />
            {errors.password && <p className="text-xs text-destructive font-bold">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-bold">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...register("confirmPassword")}
              className={`h-12 bg-gray-50 focus:bg-white ${errors.confirmPassword ? 'border-destructive' : ''}`}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive font-bold">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold text-center">
              {serverError}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 mt-4 bg-color-primary text-white hover:bg-color-primary/90 rounded-xl font-bold text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
