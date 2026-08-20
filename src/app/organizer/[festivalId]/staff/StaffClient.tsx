"use client";

import React, { useState } from 'react';
import { Plus, Shield, Ticket, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckinCounter } from '@/components/organizer/CheckinCounter';
import { ScannerMock } from '@/components/organizer/ScannerMock';
import { BulkImportWizard } from '@/components/organizer/BulkImportWizard';

import { inviteStaff } from '@/actions/staff';

export default function StaffClient({ festivalId, staff, initialScannedIn, totalExpected, teams = [], pendingInvites = [] }: { festivalId: string, staff: any[], initialScannedIn: number, totalExpected: number, teams?: any[], pendingInvites?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const customRoleName = formData.get('customRoleName') as string;
    const teamId = formData.get('teamId') as string;

    try {
      await inviteStaff(festivalId, email, role, customRoleName, teamId);
      toast.success('Invitation sent successfully');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Staff & Check-in</h1>
          <p className="text-muted-foreground mt-2">Manage event crew and monitor live entry metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportWizard festivalId={festivalId} entity="STAFF" title="Import Staff" />
          <Button onClick={() => setIsModalOpen(true)} className="bg-color-primary text-white hover:bg-color-primary/90 rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Staff Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Check-in Hub */}
        <div className="space-y-6">
          <CheckinCounter 
            festivalId={festivalId} 
            initialScannedIn={initialScannedIn} 
            totalExpected={totalExpected} 
          />
          <ScannerMock festivalId={festivalId} />
        </div>

        {/* Right: Staff Roster */}
        <div>
          {pendingInvites.length > 0 && (
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Pending Invites</h2>
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingInvites.map((invite: any) => (
                      <tr key={invite.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">{invite.email}</td>
                        <td className="px-4 py-3 font-medium">
                          <span className="bg-color-primary/10 text-color-primary px-2 py-1 rounded-full text-xs">
                            {invite.role?.name || "STAFF"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/invite?token=${invite.token}`);
                              toast.success("Invite link copied!");
                            }}
                          >
                            Copy Link
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <h2 className="font-heading text-2xl font-bold mb-6">Staff Roster</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <div className="divide-y divide-border">
              {staff.map((s, i) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{s.user.firstName} {s.user.lastName}</div>
                      <div className="text-xs text-muted-foreground">{s.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {i === 0 ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-color-primary bg-color-primary/10 px-2 py-1 rounded border border-color-primary/20">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-color-success bg-color-success/10 px-2 py-1 rounded border border-color-success/20">
                        <Ticket className="w-3 h-3" /> Scanner
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">Invite Staff</Dialog.Title>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required placeholder="staff@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select id="role" name="role" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                  <option value="ADMIN">Admin</option>
                  <option value="SCANNER">Scanner</option>
                  <option value="LEADER">Team Leader</option>
                  <option value="CUSTOM">Custom Role...</option>
                </select>
              </div>

              {selectedRole === 'CUSTOM' && (
                <div className="space-y-2">
                  <Label htmlFor="customRoleName">Custom Role Name</Label>
                  <Input id="customRoleName" name="customRoleName" required placeholder="e.g. Finance Officer" />
                </div>
              )}

              {selectedRole === 'LEADER' && (
                <div className="space-y-2">
                  <Label htmlFor="teamId">Assign to Team</Label>
                  <select id="teamId" name="teamId" required className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                    <option value="">Select a team...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-border mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-color-primary text-white">
                  {saving ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
