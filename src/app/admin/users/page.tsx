import React from 'react';
import { getUsers } from '@/actions/users';
import { Shield, ShieldAlert, ShoppingBag, Ticket } from 'lucide-react';

export default async function AdminUsersPage() {
  const { data: users } = await getUsers();

  const RoleIcon = ({ role }: { role: string }) => {
    switch (role) {
      case 'SUPER_ADMIN': return <ShieldAlert className="w-4 h-4 text-destructive" />;
      case 'ORGANIZER': return <Shield className="w-4 h-4 text-color-primary" />;
      case 'VENDOR': return <ShoppingBag className="w-4 h-4 text-color-warning" />;
      case 'ATTENDEE': return <Ticket className="w-4 h-4 text-color-success" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">Global user directory and role management.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-muted/30 transition-soft">
                <td className="p-4">
                  <div className="font-bold text-base">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{user.id}</div>
                </td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-border bg-muted/50 w-fit">
                    <RoleIcon role={user.role} />
                    {user.role.replace('_', ' ')}
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
