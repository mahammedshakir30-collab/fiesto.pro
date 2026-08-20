import React from 'react';
import { prisma } from '@/lib/prisma';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SetupVideoManager } from './SetupVideoManager';
import { getSetupVideoSettings } from '@/actions/setup-video';

export default async function AdminSettingsPage() {
  const [settings, setupVideo] = await Promise.all([
    prisma.platformSettings.findUnique({
      where: { id: 'singleton' }
    }).then(async (res) => {
      if (!res) {
        return prisma.platformSettings.create({
          data: { id: 'singleton' }
        });
      }
      return res;
    }),
    getSetupVideoSettings()
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      <div>
        <h1 className="font-heading text-4xl font-black tracking-tight text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">Manage global platform configurations and organizer onboarding content.</p>
      </div>

      {/* Super Admin Dashboard Setup Video Manager */}
      <SetupVideoManager initialVideo={setupVideo} />

      {/* Platform Settings Form */}
      <form action="/api/admin/settings" method="POST" className="space-y-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold border-b border-border pb-2">General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Platform Name</label>
              <Input name="platformName" defaultValue={settings.platformName} className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Support Email</label>
              <Input type="email" name="supportEmail" defaultValue={settings.supportEmail} className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Default Trial Days</label>
              <Input type="number" name="defaultTrialDays" defaultValue={settings.defaultTrialDays} className="bg-background" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold border-b border-border pb-2">Legal Links</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Terms of Service URL</label>
              <Input type="url" name="termsOfServiceUrl" defaultValue={settings.termsOfServiceUrl || ''} className="bg-background" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Privacy Policy URL</label>
              <Input type="url" name="privacyPolicyUrl" defaultValue={settings.privacyPolicyUrl || ''} className="bg-background" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="h-12 px-8 bg-color-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-color-primary/90 transition-colors">
            <Save className="w-5 h-5" /> Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
