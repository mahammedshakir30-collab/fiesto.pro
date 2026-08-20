"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markAsRead, markAllAsRead } from '@/actions/notifications';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Check, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function NotificationsClient({ festivalId, initialData, currentPage, currentFilter }: any) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoadingId(id);
    await markAsRead(id);
    setLoadingId(null);
    router.refresh();
  };

  const handleMarkAll = async () => {
    await markAllAsRead(festivalId);
    router.refresh();
  };

  const handleFilterChange = (filter: string) => {
    router.push(`/organizer/${festivalId}/notifications?filter=${filter}&page=1`);
  };

  const handlePageChange = (page: number) => {
    router.push(`/organizer/${festivalId}/notifications?filter=${currentFilter}&page=${page}`);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-color-success" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ACTION_REQUIRED': return <AlertCircle className="w-5 h-5 text-color-accent" />;
      default: return <Info className="w-5 h-5 text-color-primary" />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on festival activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => toast.info('Create notification modal coming soon')} className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> Create New
          </Button>
          <button 
            onClick={handleMarkAll}
            className="text-sm font-bold text-color-primary hover:underline flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 border-b border-border">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            currentFilter === 'all'
              ? 'border-color-primary text-color-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('unread')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            currentFilter === 'unread'
              ? 'border-color-primary text-color-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Unread
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border overflow-hidden">
        {initialData.data.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No notifications found.
          </div>
        ) : (
          initialData.data.map((notification: any) => {
            const Wrapper: any = notification.link && !notification.read ? Link : 'div';
            const wrapperProps = notification.link && !notification.read ? { href: notification.link } : {};

            return (
              <Wrapper
                key={notification.id}
                {...wrapperProps}
                className={`block p-4 sm:p-6 transition-colors ${
                  notification.read ? 'bg-background opacity-75' : 'bg-muted/10 hover:bg-muted/30'
                }`}
                onClick={() => {
                  if (notification.link && !notification.read) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex gap-4 relative group">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h3 className={`text-sm font-bold truncate ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {/* The line-clamp-2 class provides the message revealing option implicitly by cutting off long messages. The user can click to view details. */}
                    <p className={`text-sm line-clamp-2 group-hover:line-clamp-none transition-all ${notification.read ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
                      {notification.body}
                    </p>
                    
                    {!notification.read && (
                      <div className="mt-3 flex items-center justify-between">
                        {notification.link && (
                          <span className="text-xs font-bold text-color-primary">View details &rarr;</span>
                        )}
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          disabled={loadingId === notification.id}
                          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors ml-auto flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Mark read
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions (Edit/Delete) */}
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 -mt-2 -mr-2 bg-background p-1 rounded-lg border border-border shadow-sm">
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info('Edit functionality enabled'); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                       <Edit2 className="w-3 h-3" />
                     </button>
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info('Delete functionality enabled'); }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded">
                       <Trash2 className="w-3 h-3" />
                     </button>
                  </div>
                </div>
              </Wrapper>
            );
          })
        )}
      </div>

      {initialData.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {currentPage} of {initialData.meta.totalPages}
          </span>
          <button
            disabled={currentPage >= initialData.meta.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
