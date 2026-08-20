"use client";

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { createFaq, deleteFaq, createTutorial, deleteTutorial } from '@/actions/admin-support';

export function SupportContentClient({ faqs, tutorials }: { faqs: any[], tutorials: any[] }) {
  const [isPending, startTransition] = useTransition();

  // FAQ Form state
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '' });

  // Tutorial Form state
  const [tutForm, setTutForm] = useState({ title: '', youtubeUrl: '', description: '', category: '' });

  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer || !faqForm.category) return;
    
    startTransition(async () => {
      await createFaq(faqForm);
      setFaqForm({ question: '', answer: '', category: '' });
    });
  };

  const handleCreateTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutForm.title || !tutForm.youtubeUrl) return;
    
    startTransition(async () => {
      await createTutorial(tutForm);
      setTutForm({ title: '', youtubeUrl: '', description: '', category: '' });
    });
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Delete this FAQ?')) {
      startTransition(() => { deleteFaq(id); });
    }
  };

  const handleDeleteTut = (id: string) => {
    if (confirm('Delete this tutorial?')) {
      startTransition(() => { deleteTutorial(id); });
    }
  };

  return (
    <div className="space-y-12">
      {/* FAQs Section */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <h2 className="text-xl font-bold mb-4">FAQs</h2>
        
        <form onSubmit={handleCreateFaq} className="bg-muted/50 p-4 rounded-lg mb-6 space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground">Add New FAQ</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input placeholder="e.g. Billing, General, Setup" value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Question</Label>
              <Input placeholder="How do I..." value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Answer (Markdown)</Label>
            <Textarea placeholder="Explain here..." value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
          </div>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add FAQ
          </Button>
        </form>

        <div className="space-y-3">
          {faqs.map(faq => (
            <div key={faq.id} className="border border-border p-4 rounded-lg flex justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase bg-color-primary/10 text-color-primary px-2 py-1 rounded-full mb-2 inline-block">{faq.category}</span>
                <h4 className="font-bold">{faq.question}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteFaq(faq.id)} className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs added yet.</p>}
        </div>
      </section>

      {/* Tutorials Section */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <h2 className="text-xl font-bold mb-4">Video Tutorials</h2>
        
        <form onSubmit={handleCreateTutorial} className="bg-muted/50 p-4 rounded-lg mb-6 space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground">Add New Tutorial</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Video title" value={tutForm.title} onChange={e => setTutForm({...tutForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input placeholder="https://youtube.com/watch?v=..." value={tutForm.youtubeUrl} onChange={e => setTutForm({...tutForm, youtubeUrl: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <Input placeholder="e.g. Basics" value={tutForm.category} onChange={e => setTutForm({...tutForm, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input placeholder="Short description" value={tutForm.description} onChange={e => setTutForm({...tutForm, description: e.target.value})} />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Tutorial
          </Button>
        </form>

        <div className="space-y-3">
          {tutorials.map(tut => (
            <div key={tut.id} className="border border-border p-4 rounded-lg flex justify-between items-center gap-4">
              <div>
                {tut.category && <span className="text-[10px] font-bold uppercase bg-color-accent/10 text-color-accent px-2 py-1 rounded-full mb-2 inline-block">{tut.category}</span>}
                <h4 className="font-bold">{tut.title}</h4>
                <p className="text-xs text-muted-foreground font-mono mt-1">{tut.youtubeUrl}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteTut(tut.id)} className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {tutorials.length === 0 && <p className="text-sm text-muted-foreground">No tutorials added yet.</p>}
        </div>
      </section>
    </div>
  );
}
