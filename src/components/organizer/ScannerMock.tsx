"use client";

import React, { useState, useRef } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyTicket } from '@/actions/checkin';

interface ScannerMockProps {
  festivalId: string;
}

export function ScannerMock({ festivalId }: ScannerMockProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [ticketData, setTicketData] = useState<{name: string, type: string} | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrInput, setQrInput] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!qrInput.trim()) return;

    setStatus('scanning');
    setErrorMessage('');
    
    try {
      // Small delay to simulate network/scanning delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await verifyTicket(qrInput, festivalId);
      
      if (result.success) {
        setStatus('success');
        setTicketData({
          name: result.attendeeName,
          type: result.ticketName
        });
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Invalid ticket');
    }

    setQrInput('');
    // Auto reset after 3 seconds
    setTimeout(() => {
      setStatus('idle');
      setTicketData(null);
      if (inputRef.current) inputRef.current.focus();
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#0C0B12] rounded-3xl p-8 border border-border h-[500px] relative overflow-hidden">
      
      <div className="text-center z-10 mb-8 w-full">
        <h3 className="font-heading text-2xl font-bold text-white mb-2">Check-in Scanner</h3>
        <p className="text-muted-foreground text-sm mb-4">Simulate scanning by entering a ticket's QR code payload.</p>
        
        <form onSubmit={simulateScan} className="flex gap-2 max-w-sm mx-auto">
          <Input 
            ref={inputRef}
            placeholder="Enter QR payload..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            disabled={status !== 'idle'}
            className="bg-card/50 text-white border-color-soft"
          />
          <Button type="submit" disabled={status !== 'idle' || !qrInput.trim()} className="bg-color-primary">
            <Scan className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {status === 'idle' && (
        <div 
          className="w-48 h-48 border-4 border-dashed border-color-primary/50 rounded-2xl flex items-center justify-center cursor-pointer hover:border-color-primary hover:bg-color-primary/5 transition-soft z-10" 
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex flex-col items-center text-color-primary">
            <QrCode className="w-16 h-16 mb-4" />
            <span className="font-bold uppercase tracking-wider text-sm">Waiting</span>
          </div>
        </div>
      )}

      {status === 'scanning' && (
        <div className="w-48 h-48 border-4 border-color-accent rounded-2xl flex items-center justify-center relative z-10 overflow-hidden shadow-[0_0_40px_rgba(241,100,46,0.3)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-white animate-scan shadow-[0_0_20px_#fff]"></div>
          <QrCode className="w-24 h-24 text-color-accent opacity-50" />
        </div>
      )}

      {status === 'success' && (
        <div className="w-48 h-48 bg-color-success/20 border-2 border-color-success rounded-2xl flex flex-col items-center justify-center z-10 p-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-color-success mb-2" />
          <div className="font-bold text-white text-lg">Valid Ticket</div>
          <div className="text-color-success font-mono text-sm mt-1">{ticketData?.type}</div>
          <div className="text-white text-xs mt-1 truncate w-full px-2">{ticketData?.name}</div>
        </div>
      )}

      {status === 'error' && (
        <div className="w-48 h-48 bg-destructive/20 border-2 border-destructive rounded-2xl flex flex-col items-center justify-center z-10 p-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-2" />
          <div className="font-bold text-white text-lg">Invalid</div>
          <div className="text-destructive text-xs mt-2 line-clamp-3 px-2">{errorMessage}</div>
        </div>
      )}

      {/* Decorative background scanner lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#504E76 1px, transparent 1px), linear-gradient(90deg, #504E76 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    </div>
  );
}
