import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UpgradePage({ params }: { params: { festivalId: string } }) {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">Upgrade your Festival</h1>
        <p className="text-xl text-muted-foreground">Unlock advanced features and scale your event management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold mb-2">Basic</h2>
            <div className="text-4xl font-bold mb-2">Free</div>
            <p className="text-muted-foreground text-sm">Perfect for small, local events.</p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-color-primary" /> Up to 500 candidates</div>
            <div className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-color-primary" /> Basic digital scoring</div>
            <div className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-color-primary" /> Single stage management</div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground"><Check className="w-5 h-5 opacity-50" /> <span className="line-through">Custom domains</span></div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground"><Check className="w-5 h-5 opacity-50" /> <span className="line-through">Advanced analytics</span></div>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <Button variant="outline" className="w-full" disabled>Current Plan</Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-color-primary/5 border-2 border-color-primary rounded-3xl p-8 shadow-lg flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-color-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-heading text-2xl font-bold text-color-primary">Pro</h2>
              <Sparkles className="w-5 h-5 text-color-primary" />
            </div>
            <div className="text-4xl font-bold mb-2">$99<span className="text-xl text-muted-foreground font-normal">/event</span></div>
            <p className="text-muted-foreground text-sm">Everything you need for a major festival.</p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-color-primary" /> Unlimited candidates</div>
            <div className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-color-primary" /> Advanced multi-criteria scoring</div>
            <div className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-color-primary" /> Unlimited stages & venues</div>
            <div className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-color-primary" /> Custom domain (.fiesto.app)</div>
            <div className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-color-primary" /> Real-time analytics dashboard</div>
            <div className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-color-primary" /> Priority support</div>
          </div>
          <div className="mt-8 pt-8 border-t border-color-primary/20">
            <Button className="w-full bg-color-primary hover:bg-color-primary/90 text-white font-bold text-lg h-12">Upgrade Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
