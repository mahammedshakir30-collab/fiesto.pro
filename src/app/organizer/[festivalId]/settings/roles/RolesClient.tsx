"use client";

import React, { useState } from 'react';
import { MoreHorizontal, Plus, Copy, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleModal } from '@/components/organizer/RoleModal';
import { deleteRole } from '@/actions/roles';
import { toast } from 'sonner';

export default function RolesClient({ festivalId, initialRoles, allPermissions }: { festivalId: string, initialRoles: any[], allPermissions: any[] }) {
  const [filter, setFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const filters = [
    { id: 'ALL', label: 'All' },
    { id: 'ADMIN', label: 'Admin' },
    { id: 'FINANCE', label: 'Finance' },
    { id: 'CHECKIN', label: 'Check-in' },
    { id: 'MARKETING', label: 'Marketing' },
    { id: 'VENDOR_COORDINATOR', label: 'Vendor Coordinator' },
  ];

  const filteredRoles = initialRoles.filter(r => filter === 'ALL' || r.panelType === filter);

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(festivalId, roleId);
      toast.success("Role deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const openDuplicate = (role: any) => {
    // Pass role without ID/name to pre-fill the form
    setEditingRole({
      ...role,
      id: undefined,
      name: `${role.name} (Copy)`,
      kind: 'CUSTOM'
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Role Definitions</h1>
          <p className="text-muted-foreground mt-1">Manage access permissions for your festival staff.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-color-primary text-white'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Panel</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Permissions</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRoles.map(role => (
                <tr key={role.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{role.name}</div>
                    {role.description && <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{role.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-muted text-muted-foreground">
                      {role.panelType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {role.kind === 'SYSTEM' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-color-accent/10 text-color-accent">
                        System
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {role.permissions.length} perms
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {role._count.userRoles} users
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {role.kind !== 'SYSTEM' && (
                        <button onClick={() => openEdit(role)} className="p-2 text-muted-foreground hover:text-color-primary hover:bg-color-primary/10 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openDuplicate(role)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      {role.kind !== 'SYSTEM' && (
                        <button onClick={() => handleDelete(role.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No roles found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RoleModal
          festivalId={festivalId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRole(null);
          }}
          allPermissions={allPermissions}
          role={editingRole}
        />
      )}
    </>
  );
}
