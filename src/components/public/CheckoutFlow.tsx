"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TicketTier, Festival } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, QrCode, CreditCard, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Step = 'info' | 'payment' | 'confirmation';

import { purchaseTicket } from '@/actions/commerce';

export function CheckoutFlow({ tier, festival }: { tier: TicketTier, festival: Festival }) {
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const price = (tier.price / 100).toLocaleString('en-US', { style: 'currency', currency: tier.currency });

  const handleNext = async () => {
    if (step === 'info') {
      setStep('payment');
    } else if (step === 'payment') {
      setLoading(true);
      setError(null);
      try {
        await purchaseTicket(tier.id, festival.id, formData);
        setStep('confirmation');
      } catch (err: any) {
        setError(err.message || 'Failed to complete purchase.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      
      {/* Left side: Flow */}
      <div className="md:col-span-2 space-y-8">
        
        {step !== 'confirmation' && (
          <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-8 border-b pb-4">
            <span className={step === 'info' ? 'text-color-primary' : ''}>1. Info</span>
            <span className="text-border">&gt;</span>
            <span className={step === 'payment' ? 'text-color-primary' : ''}>2. Payment</span>
          </div>
        )}

        {step === 'info' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-heading text-3xl font-bold mb-6 flex items-center gap-2">
              <User className="text-color-accent" /> Attendee Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">First Name</label>
                  <Input 
                    placeholder="Jane" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-white h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Last Name</label>
                  <Input 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-white h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="jane@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white h-12"
                />
              </div>
              <Button 
                onClick={handleNext} 
                disabled={!formData.firstName || !formData.lastName || !formData.email}
                className="w-full h-14 bg-color-primary text-white hover:bg-color-primary/90 rounded-xl font-bold mt-8"
              >
                Continue to Payment
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-heading text-3xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-color-accent" /> Mock Payment
            </h2>
            <div className="p-6 bg-color-soft/20 rounded-2xl border border-color-soft border-dashed text-center space-y-4 mb-8">
              <p className="font-sans text-muted-foreground">This is a simulated checkout. No real payment will be processed.</p>
              <div className="space-y-2 max-w-sm mx-auto text-left">
                <Input placeholder="Card Number" value="4242 4242 4242 4242" readOnly className="bg-white h-12" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="MM/YY" value="12/26" readOnly className="bg-white h-12" />
                  <Input placeholder="CVC" value="123" readOnly className="bg-white h-12" />
                </div>
              </div>
              {error && (
                <div className="p-3 mt-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-bold text-sm">
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('info')} className="h-14 px-8 rounded-xl font-bold">Back</Button>
              <Button 
                onClick={handleNext} 
                disabled={loading}
                className="flex-1 h-14 bg-color-accent text-white hover:bg-color-accent/90 rounded-xl font-bold"
              >
                {loading ? 'Processing...' : `Pay ${price}`}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-12">
            <div className="w-24 h-24 bg-color-success text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-color-success/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="font-heading text-4xl font-bold">You are going to {festival.name}!</h2>
            <p className="text-muted-foreground font-sans text-lg">A confirmation email has been sent to {formData.email}.</p>
            
            <div className="p-8 bg-white rounded-3xl border shadow-soft-lg max-w-sm mx-auto mt-8 flex flex-col items-center gap-4">
              <QrCode className="w-48 h-48 text-color-primary" />
              <div className="text-center">
                <div className="font-bold text-lg">{formData.firstName} {formData.lastName}</div>
                <div className="text-muted-foreground text-sm">{tier.name}</div>
              </div>
            </div>

            <div className="pt-8">
              <Button variant="outline" asChild className="rounded-full font-bold">
                <Link href={`/festivals/${festival.slug}`}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Festival</Link>
              </Button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Right side: Order Summary */}
      {step !== 'confirmation' && (
        <div className="md:col-span-1">
          <div className="sticky top-24 p-6 bg-card border rounded-3xl shadow-soft">
            <h3 className="font-heading text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-4 font-sans text-sm">
              <div>
                <div className="text-muted-foreground font-bold">Festival</div>
                <div className="text-foreground text-lg">{festival.name}</div>
              </div>
              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between font-bold">
                  <span>{tier.name}</span>
                  <span>{price}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between font-display text-2xl text-color-primary">
                  <span>Total</span>
                  <span>{price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
