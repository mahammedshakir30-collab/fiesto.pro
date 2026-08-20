"use client";

import React, { useState, useMemo } from 'react';
import { X, Search, Shield, ChevronDown, ChevronRight, Activity, DollarSign, Store, Megaphone, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createRole, updateRole } from '@/actions/roles';
import { toast } from 'sonner';

interface Permission {
  id: string;
  resource: string;
  action: string;
}

interface RoleModalProps {
  festivalId: string;
  isOpen: boolean;
  onClose: () => void;
  allPermissions: Permission[];
  role?: {
    id: string;
    name: string;
    description: string | null;
    panelType: string;
    kind: string;
    permissions: Permission[];
  };
}

const PANEL_TYPES = [
  { id: 'ALL', label: 'All Access', icon: <Shield className="w-5 h-5 mb-1" /> },
  { id: 'ADMIN', label: 'Admin', icon: <Settings className="w-5 h-5 mb-1" /> },
  { id: 'FINANCE', label: 'Finance', icon: <DollarSign className="w-5 h-5 mb-1" /> },
  { id: 'CHECKIN', label: 'Check-in', icon: <Activity className="w-5 h-5 mb-1" /> },
  { id: 'MARKETING', label: 'Marketing', icon: <Megaphone className="w-5 h-5 mb-1" /> },
  { id: 'VENDOR_COORDINATOR', label: 'Vendors', icon: <Store className="w-5 h-5 mb-1" /> },
  { id: 'CUSTOM', label: 'Custom', icon: <Settings className="w-5 h-5 mb-1" /> },
];

export function RoleModal({ festivalId, isOpen, onClose, allPermissions, role }: RoleModalProps) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [panelType, setPanelType] = useState(role?.panelType || 'ADMIN');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    new Set(role?.permissions?.map(p => p.id) || [])
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Group permissions by resource
  const groupedPerms = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach(p => {
      if (!groups[p.resource]) groups[p.resource] = [];
      groups[p.resource].push(p);
    });
    return groups;
  }, [allPermissions]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groupedPerms;
    const lowerQ = searchQuery.toLowerCase();
    const result: Record<string, Permission[]> = {};
    Object.entries(groupedPerms).forEach(([res, perms]) => {
      if (res.toLowerCase().includes(lowerQ) || perms.some(p => p.action.toLowerCase().includes(lowerQ))) {
        result[res] = perms;
      }
    });
    return result;
  }, [groupedPerms, searchQuery]);

  if (!isOpen) return null;

  const handleTogglePerm = (id: string) => {
    const next = new Set(selectedPerms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPerms(next);
  };

  const handleSelectAllResource = (resource: string, perms: Permission[]) => {
    const allSelected = perms.every(p => selectedPerms.has(p.id));
    const next = new Set(selectedPerms);
    if (allSelected) {
      perms.forEach(p => next.delete(p.id));
    } else {
      perms.forEach(p => next.add(p.id));
    }
    setSelectedPerms(next);
  };

  const handleSelectAllGlobal = () => {
    if (selectedPerms.size === allPermissions.length) {
      setSelectedPerms(new Set());
    } else {
      setSelectedPerms(new Set(allPermissions.map(p => p.id)));
    }
  };

  const toggleGroup = (res: string) => {
    setExpandedGroups(prev => ({ ...prev, [res]: !prev[res] }));
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Role name is required");
    if (selectedPerms.size === 0) return toast.error("Select at least one permission");

    setSaving(true);
    try {
      const data = {
        name,
        description,
        panelType,
        permissionIds: Array.from(selectedPerms)
      };

      if (role) {
        await updateRole(festivalId, role.id, data);
        toast.success("Role updated");
      } else {
        await createRole(festivalId, data);
        toast.success("Role created");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-primary/10 flex items-center justify-center text-color-primary">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl">{role ? 'Edit Role' : 'Add Role'}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {/* Basics */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Role Name *</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border focus:outline-none focus:border-color-primary bg-background"
                placeholder="e.g. Marketing Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-border focus:outline-none focus:border-color-primary bg-background resize-none h-20"
                placeholder="What does this role do?"
              />
            </div>
          </div>

          {/* Panel Type */}
          <div>
            <label className="block text-sm font-bold mb-3">Panel Dashboard Access</label>
            <div className="flex flex-wrap gap-3">
              {PANEL_TYPES.map(pt => (
                <button
                  key={pt.id}
                  onClick={() => setPanelType(pt.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    panelType === pt.id 
                      ? 'border-color-primary bg-color-primary/5 text-color-primary' 
                      : 'border-border bg-card text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {pt.icon}
                  <span className="text-xs font-bold mt-1 text-center">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Permissions</h3>
                <p className="text-sm text-muted-foreground">{selectedPerms.size} / {allPermissions.length} selected</p>
              </div>
              <button 
                onClick={handleSelectAllGlobal}
                className="text-sm font-bold text-color-primary hover:underline"
              >
                {selectedPerms.size === allPermissions.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            
            <div className="p-4 border-b border-border bg-background">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search resources or actions..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border-none focus:outline-none focus:ring-2 ring-color-primary/20 text-sm"
                />
              </div>
            </div>

            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {Object.entries(filteredGroups).map(([res, perms]) => {
                const isExpanded = expandedGroups[res] !== false; // default expanded
                const allSelected = perms.every(p => selectedPerms.has(p.id));
                const someSelected = perms.some(p => selectedPerms.has(p.id));

                return (
                  <div key={res} className="bg-background">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <div 
                        className="flex items-center gap-2 cursor-pointer select-none flex-1"
                        onClick={() => toggleGroup(res)}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-bold uppercase tracking-wider text-sm">{res.replace('_', ' ')}</span>
                        {someSelected && !allSelected && <span className="w-2 h-2 rounded-full bg-color-accent ml-2" />}
                      </div>
                      <button 
                        onClick={() => handleSelectAllResource(res, perms)}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground mr-2"
                      >
                        {allSelected ? 'Deselect group' : 'Select group'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 pt-0 pl-10 bg-background">
                        {perms.map(p => (
                          <label key={p.id} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              selectedPerms.has(p.id) ? 'bg-color-primary border-color-primary' : 'border-input bg-background group-hover:border-color-primary'
                            }`}>
                              {selectedPerms.has(p.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-sm">{p.action.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {Object.keys(filteredGroups).length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No permissions found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold px-6">
            {saving ? 'Saving...' : (role ? 'Save Changes' : 'Create Role')}
          </Button>
        </div>

      </div>
    </div>
  );
}
