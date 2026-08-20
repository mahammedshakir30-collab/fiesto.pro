"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: "onSubmit"
  });

  const onSubmit = async (data: SigninFormValues) => {
    setServerError("");
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        setServerError(res.error);
      } else {
        router.push("/portal");
        router.refresh();
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#504E76] via-[#3d3b5c] to-[#2a2840] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#F1642E]/20 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#A3B565]/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F1642E] to-[#FCDD9D] flex items-center justify-center text-white font-display text-2xl shadow-xl group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="font-display text-4xl text-white tracking-wide">FIESTO</span>
          </Link>
          <p className="text-white/60 mt-3 text-sm font-sans">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-[#F1642E]" />
            <h1 className="font-heading text-xl font-bold text-white">Secure Sign In</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-white/80 text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#F1642E] focus:ring-[#F1642E]/20 rounded-xl ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-300 font-bold">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-white/80 text-sm">Password</Label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#F1642E] hover:text-[#FCDD9D] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#F1642E] focus:ring-[#F1642E]/20 rounded-xl pr-12 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-300 font-bold">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm font-bold text-center">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 mt-2 bg-gradient-to-r from-[#F1642E] to-[#e55a26] text-white hover:opacity-90 rounded-xl font-bold text-base shadow-lg shadow-[#F1642E]/20 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-sans text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-[#F1642E] hover:text-[#FCDD9D] transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
