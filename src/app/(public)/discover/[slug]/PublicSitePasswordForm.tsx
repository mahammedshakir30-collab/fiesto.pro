"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function PublicSitePasswordForm({ 
  festivalId, 
  festivalName, 
  expectedPassword 
}: { 
  festivalId: string;
  festivalName: string;
  expectedPassword: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      // Set a cookie (in a real app, this should be an HttpOnly secure cookie set via a server action)
      // For this demo, we'll set it client side so layout can read it on reload
      document.cookie = `festos_site_auth_${festivalId}=${password}; path=/; max-age=86400`;
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-xl border">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-color-primary/10 rounded-full flex items-center justify-center text-color-primary">
          <Lock className="w-6 h-6" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold font-heading text-center mb-2">{festivalName}</h2>
      <p className="text-center text-muted-foreground mb-8">This site is protected. Please enter the password to view it.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {error && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
        </div>
        <Button type="submit" className="w-full h-12 text-md font-bold">Enter Site</Button>
      </form>
    </div>
  );
}
