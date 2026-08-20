"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      await requestPasswordReset(data.email);
    } catch (e) {
      // Ignore errors for security reasons
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-color-base flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft text-center space-y-6 border border-border">
          <div className="w-20 h-20 bg-color-success text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-color-success/30">
            <MailCheck className="w-10 h-10" />
          </div>
          <h2 className="font-heading text-3xl font-bold">Check Your Email</h2>
          <p className="font-sans text-muted-foreground">
            If an account exists for this email, we've sent a password reset link. Please check your inbox and spam folder.
          </p>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold">
            <Link href="/signin">Return to Sign In</Link>
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
        
        <Link href="/signin" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-color-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in
        </Link>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-color-primary">Reset Password</h1>
          <p className="font-sans text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              {...register("email")}
              className={`h-12 bg-gray-50 focus:bg-white ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && <p className="text-xs text-destructive font-bold">{errors.email.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 mt-4 bg-color-primary text-white hover:bg-color-primary/90 rounded-xl font-bold text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
