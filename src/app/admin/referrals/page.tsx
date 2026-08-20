import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { markReferralRewarded } from '@/actions/admin-referrals';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminReferralsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/unauthorized');

  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // We need to hydrate referrer details and referred festival details
  const referrerUserIds = referrals.map(r => r.referrerUserId);
  const referredFestivalIds = referrals.map(r => r.referredFestivalId);

  const referrers = await prisma.user.findMany({
    where: { id: { in: referrerUserIds } },
    select: { id: true, name: true, email: true }
  });

  const festivals = await prisma.festival.findMany({
    where: { id: { in: referredFestivalIds } },
    select: { id: true, name: true }
  });

  const refMap = new Map(referrers.map(r => [r.id, r]));
  const festMap = new Map(festivals.map(f => [f.id, f]));

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Referrals</h1>
        <p className="text-muted-foreground mt-1">Manage platform referrals and issue rewards.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Referrer</th>
              <th className="px-6 py-4">Referred Festival</th>
              <th className="px-6 py-4">Code Used</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {referrals.map((r) => {
              const referrer = refMap.get(r.referrerUserId);
              const festival = festMap.get(r.referredFestivalId);

              return (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold">{referrer?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{referrer?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{festival?.name || r.referredFestivalId}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{r.code}</td>
                  <td className="px-6 py-4">
                    {r.status === 'PENDING' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase">Pending</span>}
                    {r.status === 'CONVERTED' && <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase">Converted</span>}
                    {r.status === 'REWARDED' && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase">Rewarded</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'CONVERTED' && (
                      <form action={async () => {
                        "use server";
                        await markReferralRewarded(r.id);
                        revalidatePath('/admin/referrals');
                      }}>
                        <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Mark Rewarded
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {referrals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No referrals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
