import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-color-base text-foreground min-h-screen">
      {/* Editorial Header */}
      <section className="bg-color-primary text-color-base py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="font-display text-6xl md:text-8xl uppercase tracking-widest leading-[0.85] mb-8">
              We <span className="text-color-accent">Are</span> <br /> FIESTO.
            </h1>
            <p className="font-sans text-xl md:text-3xl text-color-soft/90 max-w-2xl leading-relaxed">
              FIESTO was born out of a desire to tear down the wall between organizers and fans, creating the most seamless, transparent, and electrifying live event ecosystem on the planet.
            </p>
          </div>
        </div>
      </section>

      {/* Stats / Value Prop */}
      <section className="py-24 border-b border-border bg-[#F2EEDD]">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="font-display text-7xl text-color-accent">1M+</div>
            <h3 className="font-heading text-2xl font-bold">Fans Connected</h3>
            <p className="font-sans text-muted-foreground">Across the globe, we have helped millions of fans experience the music they love.</p>
          </div>
          <div className="space-y-4">
            <div className="font-display text-7xl text-color-accent">500+</div>
            <h3 className="font-heading text-2xl font-bold">Festivals Powered</h3>
            <p className="font-sans text-muted-foreground">From indie gatherings in the desert to massive arena takeovers.</p>
          </div>
          <div className="space-y-4">
            <div className="font-display text-7xl text-color-accent">0</div>
            <h3 className="font-heading text-2xl font-bold">Hidden Fees</h3>
            <p className="font-sans text-muted-foreground">We believe in transparent pricing. What you see is what you pay.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="font-heading text-5xl md:text-7xl font-bold tracking-tight">Drop Us A Line.</h2>
              <p className="font-sans text-xl text-muted-foreground max-w-md">
                Whether you're an organizer looking to supercharge your next event, or a fan with a question, we're here for you.
              </p>
              
              <div className="space-y-6 pt-8 font-sans font-medium text-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-color-soft/20 rounded-full flex items-center justify-center text-color-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>getfiesto@gmail.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-color-soft/20 rounded-full flex items-center justify-center text-color-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>6282120231</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-color-soft/20 rounded-full flex items-center justify-center text-color-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>123 Noise Ave, Los Angeles, CA</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <form className="p-8 md:p-12 bg-white rounded-[2rem] border shadow-soft-lg space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Your Name</label>
                  <Input placeholder="Enter your name" className="bg-color-base h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Email Address</label>
                  <Input placeholder="Enter your email" type="email" className="bg-color-base h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Message</label>
                  <textarea 
                    className="w-full min-h-[150px] p-4 rounded-xl border border-input bg-color-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 custom-scrollbar"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <Button className="w-full h-14 bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold text-lg">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
