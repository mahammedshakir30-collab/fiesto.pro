"use client";

import React, { useState, useMemo } from 'react';
import { Mail, Phone, MessageCircle, AlertCircle, Search, Video, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { Input } from '@/components/ui/input';

export default function SupportHubClient({
  festival,
  settings,
  faqs,
  tutorials,
  isLiveEvent,
  user
}: any) {
  const [activeTab, setActiveTab] = useState<'tutorials' | 'support' | 'faq'>('tutorials');
  
  // FAQ state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Tutorial state
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Helpers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const supportEmail = settings?.supportEmail || 'support@festos.app';
  const supportPhone = '+91 80000 00000'; // Hardcoded for demo, normally from settings
  const supportWaNumber = '918000000000'; // Separate from sales number

  const waLink = buildWhatsAppLink(supportWaNumber, `Hi FestOS Support,

Festival: {{festivalName}} ({{festivalId}})
Organizer: {{organizerName}} ({{organizerEmail}})

I need help with:
`, {
    festivalName: festival.name,
    festivalId: festival.id,
    organizerName: user.name || 'Organizer',
    organizerEmail: user.email || 'N/A'
  });

  // Filter FAQs
  const categories = useMemo(() => {
    const cats = new Set(faqs.map((f: any) => f.category));
    return ['All', ...Array.from(cats)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f: any) => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchQuery = f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <div className="space-y-8 font-sans">
      {/* Tabs */}
      <div className="flex bg-[#C4C3E3]/30 p-1 rounded-2xl w-full max-w-md mx-auto">
        {(['tutorials', 'support', 'faq'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-colors ${
              activeTab === tab ? 'bg-white text-[#504E76] shadow-sm' : 'text-muted-foreground hover:text-[#504E76]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TUTORIALS TAB */}
      {activeTab === 'tutorials' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#504E76]">Video Tutorials</h2>
          {tutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutorials.map((video: any) => (
                <div key={video.id} className="bg-white border border-[#C4C3E3] rounded-3xl overflow-hidden shadow-soft cursor-pointer hover:border-[#504E76] transition-colors" onClick={() => setSelectedVideo(video)}>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    <Video className="w-12 h-12 text-[#C4C3E3]" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-[#504E76] ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {video.category && <span className="text-[10px] font-bold uppercase text-[#F1642E] bg-[#F1642E]/10 px-2 py-1 rounded-full mb-2 inline-block">{video.category}</span>}
                    <h3 className="font-bold text-[#504E76] line-clamp-1">{video.title}</h3>
                    {video.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-gray-50 border border-dashed border-[#C4C3E3] rounded-3xl">
              <p className="text-muted-foreground">No tutorials available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {isLiveEvent && (
            <div className="bg-[#F1642E] text-white p-6 rounded-3xl shadow-soft flex items-start gap-4">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-xl font-black mb-1">Live Event Priority Support</h3>
                <p className="text-white/90 mb-4 text-sm max-w-2xl">
                  Since your festival "{festival.name}" is currently active, you have access to priority routing. 
                  Call the emergency operations number below for immediate assistance.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" className="bg-white text-[#F1642E] hover:bg-gray-100" asChild>
                    <a href="tel:+918888888888">Call Ops Room</a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="bg-white border border-[#C4C3E3] p-8 rounded-3xl shadow-soft">
              <div className="w-12 h-12 bg-[#504E76]/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#504E76]" />
              </div>
              <h3 className="text-lg font-bold text-[#504E76] mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-6">For general inquiries and billing issues. Replies within 24 hours.</p>
              <div className="flex gap-2">
                <Button className="flex-1 bg-[#504E76] text-white hover:bg-[#504E76]/90" asChild>
                  <a href={`mailto:${supportEmail}`}>Compose Email</a>
                </Button>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(supportEmail)}>
                  <Copy className="w-4 h-4 text-[#504E76]" />
                </Button>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white border border-[#C4C3E3] p-8 rounded-3xl shadow-soft">
              <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="text-lg font-bold text-[#504E76] mb-1">WhatsApp Chat</h3>
              <p className="text-sm text-muted-foreground mb-6">Quick answers and setup assistance from our support team.</p>
              <Button className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90" asChild>
                <a href={waLink} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
              </Button>
            </div>

            {/* Phone */}
            <div className="bg-white border border-[#C4C3E3] p-8 rounded-3xl shadow-soft">
              <div className="w-12 h-12 bg-[#A3B565]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#A3B565]" />
              </div>
              <h3 className="text-lg font-bold text-[#504E76] mb-1">Phone Helpline</h3>
              <p className="text-sm text-muted-foreground mb-6">Available during standard business hours (10 AM - 6 PM IST).</p>
              <div className="flex gap-2">
                <Button className="flex-1 bg-white border border-[#C4C3E3] text-[#504E76] hover:bg-gray-50" asChild>
                  <a href={`tel:${supportPhone}`}>Call Now</a>
                </Button>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(supportPhone)}>
                  <Copy className="w-4 h-4 text-[#504E76]" />
                </Button>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-[#FDF8E2] border border-[#FCDD9D] p-8 rounded-3xl shadow-soft flex flex-col justify-center">
              <h3 className="text-lg font-bold text-[#504E76] mb-2">Support Hours</h3>
              <ul className="space-y-2 text-sm text-[#504E76]">
                <li className="flex justify-between border-b border-[#FCDD9D] pb-1"><span>Monday - Friday</span> <span className="font-bold">10:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between border-b border-[#FCDD9D] pb-1"><span>Saturday</span> <span className="font-bold">10:00 AM - 2:00 PM</span></li>
                <li className="flex justify-between pt-1 text-muted-foreground"><span>Sunday</span> <span>Closed</span></li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">Current timezone: Indian Standard Time (IST)</p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ TAB */}
      {activeTab === 'faq' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="text-[#F1642E] pl-12 h-14 rounded-2xl bg-white border-[#C4C3E3]"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeCategory === cat ? 'bg-[#504E76] text-white' : 'bg-white border border-[#C4C3E3] text-[#504E76] hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#C4C3E3] rounded-3xl overflow-hidden shadow-soft divide-y divide-[#C4C3E3]/50">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq: any) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id}>
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <span className="font-bold text-[#504E76] text-lg pr-4">{faq.question}</span>
                      {isOpen ? <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-muted-foreground prose prose-sm max-w-none">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No results found for "{searchQuery}" in {activeCategory}.</p>
                <Button onClick={() => setActiveTab('support')} variant="outline" className="border-[#C4C3E3] text-[#504E76]">
                  Contact Support
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl relative">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white z-10 transition-colors"
            >
              ×
            </button>
            {/* Simple embed approach, assuming youtubeUrl is the watch url, convert to embed */}
            <div className="aspect-video bg-black w-full relative">
              <iframe 
                src={selectedVideo.youtubeUrl.replace('watch?v=', 'embed/')} 
                className="absolute inset-0 w-full h-full"
                allowFullScreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#504E76]">{selectedVideo.title}</h2>
              {selectedVideo.description && <p className="text-muted-foreground mt-2">{selectedVideo.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
