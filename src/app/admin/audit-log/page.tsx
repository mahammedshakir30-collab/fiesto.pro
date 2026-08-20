import React from 'react';
import { prisma } from '@/lib/prisma';
import { ShieldAlert, Search } from 'lucide-react';

export default async function AdminAuditLogPage() {
  const logs = await prisma.platformAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100 // pagination could be added here
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground mt-2">Immutable record of all platform-level mutating actions.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by action or target..." 
              className="text-[#F1642E] w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-color-primary"
            />
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">No Audit Logs</h3>
            <p className="text-muted-foreground">No actions have been performed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Timestamp</th>
                  <th className="px-6 py-4">Actor ID</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Type</th>
                  <th className="px-6 py-4">Target ID</th>
                  <th className="px-6 py-4 rounded-tr-xl">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {log.actorId}
                    </td>
                    <td className="px-6 py-4 font-bold text-color-accent">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 uppercase tracking-wider text-xs">
                      {log.targetType}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {log.targetId}
                    </td>
                    <td className="px-6 py-4">
                      {log.metadata ? (
                        <pre className="text-[10px] bg-muted p-2 rounded max-w-[200px] overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
