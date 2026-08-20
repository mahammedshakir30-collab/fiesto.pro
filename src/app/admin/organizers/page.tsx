import React from 'react';
import { getOrganizers } from '@/actions/users';
import { CheckCircle2, Globe, Mail, Eye } from 'lucide-react';
import { OrganizerVerificationToggle } from './OrganizerVerificationToggle';
import Link from 'next/link';

export default async function AdminOrganizersPage() {
  const { data: organizers } = await getOrganizers();

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Organizers</h1>
        <p className="text-muted-foreground mt-2">Manage organizer accounts and KYC approvals.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium hidden md:table-cell">Contact</th>
              <th className="p-4 font-medium">Verification</th>
              <th className="p-4 font-medium hidden lg:table-cell">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {organizers.map(org => {
              const user = org.user;
              return (
                <tr key={org.id} className="hover:bg-muted/30 transition-soft group">
                  <td className="p-4">
                    <div className="font-bold text-base mb-1">{org.companyName}</div>
                    <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      {org.website && <a href={org.website} target="_blank" className="hover:text-color-accent flex items-center gap-1"><Globe className="w-3 h-3" /> {new URL(org.website).hostname}</a>}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{org.contactEmail}</span>
                    </div>
                    {user && <div className="text-xs text-muted-foreground mt-1">Owner: {user.firstName} {user.lastName}</div>}
                  </td>
                  <td className="p-4">
                    {org.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-color-success/20 text-color-success border border-color-success/30">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-color-warning/20 text-color-warning border border-color-warning/30">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <OrganizerVerificationToggle organizerId={org.id} verified={org.verified} />
                      <Link 
                        href={`/admin/organizers/${org.id}`}
                        className="p-2 bg-muted hover:bg-color-primary hover:text-white rounded-lg transition-colors text-muted-foreground inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
