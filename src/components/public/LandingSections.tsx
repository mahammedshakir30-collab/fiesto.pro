"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Festival } from "@/lib/types";
import {
  ArrowRight, Music, Ticket, Sparkles, Trophy, Calendar, MapPin,
  Loader2, Eye, EyeOff, LayoutDashboard, LogIn, CheckCircle2
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Inline Sign-In Form (shown in hero when not logged in) ────────────────
function HeroSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError(res.error.length > 80 ? res.error.slice(0, 80) + "…" : res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      router.push("/portal");
      router.refresh();
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle2 className="w-10 h-10 text-[#A3B565]" />
        <p className="text-white font-bold">Signing you in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#F1642E] rounded-xl text-sm"
        />
      </div>
      <div className="relative">
        <Input
          type={showPw ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#F1642E] rounded-xl text-sm pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPw(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-300 font-semibold text-center bg-red-500/20 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-[#F1642E] hover:bg-[#e55a26] text-white font-bold rounded-xl shadow-lg shadow-[#F1642E]/20 transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In →"}
      </Button>

      <div className="flex items-center justify-between pt-1">
        <Link href="/forgot-password" className="text-xs text-white/50 hover:text-white/80 transition-colors">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-xs text-[#F1642E] hover:text-[#FCDD9D] font-bold transition-colors">
          Create account →
        </Link>
      </div>
    </form>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────
export function Hero({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-[#504E76] text-white pt-20 pb-16">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#F1642E]/25 blur-[120px]" />
        <div className="absolute bottom-[5%] -left-[10%] w-[450px] h-[450px] rounded-full bg-[#FDF8E2]/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#504E76]/60 blur-[80px]" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Headline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-center lg:text-left"
          >
            <span className="inline-block py-1.5 px-4 rounded-full border border-[#F1642E]/40 bg-[#F1642E]/10 text-[#F1642E] text-xs font-bold tracking-widest uppercase">
              Festival Management Platform
            </span>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-wider leading-[0.9]">
              Feel The{" "}
              <br className="hidden sm:block" />
              <span className="text-[#F1642E]">Noise.</span>
            </h1>

            <p className="font-sans text-base sm:text-lg md:text-xl text-white/75 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Discover premier festivals, track live team leaderboards, manage competitions, and experience events seamlessly.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/discover">
                <Button size="lg" className="bg-[#F1642E] text-white hover:bg-[#e55a26] rounded-full h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold shadow-lg shadow-[#F1642E]/25 min-h-[44px] gap-2">
                  Explore Festivals <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold bg-transparent min-h-[44px]">
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-2 justify-center lg:justify-start">
              {[["500+", "Festivals"], ["12K+", "Teams"], ["99%", "Uptime"]].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <div className="font-display text-xl sm:text-2xl font-bold text-[#F1642E]">{val}</div>
                  <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider">{lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Sign-in card */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {isLoggedIn ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#A3B565]/20 flex items-center justify-center mx-auto">
                    <LayoutDashboard className="w-7 h-7 text-[#A3B565]" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-white">Welcome Back!</h2>
                  <p className="text-white/60 text-sm">You&apos;re signed in. Go to your workspace to manage your festivals.</p>
                  <Link href="/portal" className="block">
                    <Button className="w-full h-11 bg-[#A3B565] hover:bg-[#8fa054] text-white font-bold rounded-xl gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Workspace
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-[#F1642E]/20 flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-[#F1642E]" />
                    </div>
                    <h2 className="font-heading text-lg font-bold text-white">Sign In</h2>
                  </div>
                  <HeroSignInForm />
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex items-center justify-center gap-4 text-white/40 text-xs">
              <span className="flex items-center gap-1">🔒 Secure</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Instant access</span>
              <span>•</span>
              <span className="flex items-center gap-1">🌍 Multi-festival</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ─── Featured Festival ─────────────────────────────────────────────────────
export function FeaturedFestival({ festival }: { festival?: Festival }) {
  if (!festival) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-color-base text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#F1642E]" />
              <span className="text-xs uppercase font-bold tracking-wider text-[#F1642E]">Spotlight</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Featured Event</h2>
            <p className="font-sans text-sm sm:text-base text-muted-foreground mt-1">The most anticipated lineup is live.</p>
          </div>
          <Link href="/discover">
            <Button variant="outline" className="rounded-full font-bold border-border text-foreground hover:border-[#504E76] min-h-[40px] text-sm whitespace-nowrap">
              View All →
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group relative rounded-3xl overflow-hidden bg-[#504E76] aspect-[16/9] sm:aspect-[3/1] shadow-xl flex items-end p-5 sm:p-8 lg:p-10 border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          {festival.coverImageUrl && (
            <Image src={festival.coverImageUrl} alt={festival.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw" />
          )}
          <div className="absolute inset-0 bg-[#504E76]/30 mix-blend-multiply z-0" />

          <div className="relative z-20 w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 text-white">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-[#F1642E] rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">Featured Live</span>
                {festival.competitionModeEnabled && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">Competitions Active</span>
                )}
              </div>
              <h3 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide leading-none">{festival.name}</h3>
              <p className="font-sans text-xs sm:text-sm text-white/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#F1642E]" /> {festival.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[#F1642E]" /> {new Date(festival.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
              </p>
            </div>
            <Link href={`/discover/${festival.slug}`} className="w-full sm:w-auto flex-shrink-0">
              <Button size="lg" className="bg-[#F1642E] text-white hover:bg-[#e55a26] rounded-2xl h-11 sm:h-14 px-6 sm:px-8 font-bold text-sm sm:text-base w-full sm:w-auto shadow-lg min-h-[44px]">
                Explore Festival
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────
export function HowItWorks() {
  const steps = [
    {
      icon: <Music className="w-7 h-7 text-[#504E76]" />,
      title: "1. Discover & Follow",
      description: "Explore upcoming festivals, check stage lineups, and follow your favorite institutions and teams."
    },
    {
      icon: <Ticket className="w-7 h-7 text-[#F1642E]" />,
      title: "2. Instant Access",
      description: "Secure event tickets with zero hassle, generate digital passes, and access gate-ready badges."
    },
    {
      icon: <Trophy className="w-7 h-7 text-[#504E76]" />,
      title: "3. Live Scores",
      description: "Track real-time scores, team points leaderboards, and rankings as events conclude."
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F2EEDD] border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#F1642E]" />
          <span className="text-xs uppercase font-bold tracking-wider text-[#F1642E]">Platform</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-14 tracking-tight text-[#504E76]">
          How FIESTO Works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">{step.title}</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

