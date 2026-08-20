import React from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smartphone, Mail, Globe } from 'lucide-react';
import { getFestivalById } from '@/actions/utils';
import { getAnnouncements } from '@/actions/announcements';

export default async function FestivalAnnouncementsPage({ params }: { params: { festivalId: string } }) {
  const festival = await getFestivalById(params.festivalId);
  if (!festival) notFound();

  const announcements = await getAnnouncements(festival.id);

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-2">Send live push notifications and emails to attendees.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Compose Form */}
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold">New Message</h2>
          <form className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Title</label>
              <Input placeholder="e.g. Schedule Update: Main Stage" className="bg-background h-12" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea 
                className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 custom-scrollbar"
                placeholder="Write your announcement..."
              ></textarea>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Channels</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer border border-border p-3 rounded-xl flex-1 hover:bg-muted transition-soft">
                  <input type="checkbox" className="accent-color-primary" defaultChecked />
                  <Smartphone className="w-4 h-4 text-color-primary" /> App Push
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer border border-border p-3 rounded-xl flex-1 hover:bg-muted transition-soft">
                  <input type="checkbox" className="accent-color-primary" defaultChecked />
                  <Mail className="w-4 h-4 text-color-primary" /> Email
                </label>
              </div>
            </div>

            <Button className="w-full h-14 bg-color-accent text-white hover:bg-color-accent/90 rounded-xl font-bold text-lg mt-4">
              <Send className="w-5 h-5 mr-2" /> Send Now
            </Button>
          </form>
        </div>

        {/* History */}
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold">History</h2>
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{ann.title}</h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(ann.publishedAt || ann.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ann.body}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-muted px-2 py-1 rounded text-foreground border border-border">
                    <Globe className="w-3 h-3" /> Web
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-color-primary/20 text-color-primary px-2 py-1 rounded border border-color-primary/30">
                    <Smartphone className="w-3 h-3" /> Push
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
