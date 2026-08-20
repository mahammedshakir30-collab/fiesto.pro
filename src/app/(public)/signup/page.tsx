"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/actions/auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      document.cookie = `festos_ref_code=${ref}; path=/; max-age=2592000;`; // 30 days
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });
  const onSubmit = async (data: SignupFormValues) => {
    setServerError("");
    try {
      await registerUser(data);
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password
      });
      if (res?.error) {
        setServerError(res.error);
      } else {
        router.push("/portal");
        router.refresh();
      }
    } catch (err: any) {
      setServerError(err.message || "Failed to create account. Please try again.");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/portal" });
  };

  return (
    <div className="min-h-screen bg-color-base flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-border relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-color-accent" />
        
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-color-primary">Join Fiesto</h1>
          <p className="font-sans text-muted-foreground mt-2">Create your attendee account today</p>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGoogleSignIn}
          className="w-full h-12 mb-6 rounded-xl font-bold border-2 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold text-muted-foreground">
            <span className="bg-white px-4">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-bold">First Name</Label>
              <Input 
                id="firstName" 
                {...register("firstName")}
                className={`h-12 bg-gray-50 focus:bg-white ${errors.firstName ? 'border-destructive' : ''}`}
              />
              {errors.firstName && <p className="text-xs text-destructive font-bold">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-bold">Last Name</Label>
              <Input 
                id="lastName" 
                {...register("lastName")}
                className={`h-12 bg-gray-50 focus:bg-white ${errors.lastName ? 'border-destructive' : ''}`}
              />
              {errors.lastName && <p className="text-xs text-destructive font-bold">{errors.lastName.message}</p>}
            </div>
          </div>
          
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

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">Password</Label>
            <Input 
              id="password" 
              type="password" 
              {...register("password")}
              className={`h-12 bg-gray-50 focus:bg-white ${errors.password ? 'border-destructive' : ''}`}
            />
            {errors.password && <p className="text-xs text-destructive font-bold">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-bold">Confirm Password</Label>
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
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-sans text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="font-bold text-color-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
