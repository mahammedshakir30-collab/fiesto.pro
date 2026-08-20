import React from "react";
import { DashboardSidebar } from "@/components/organizer/DashboardSidebar";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ShieldAlert } from "lucide-react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { festivalId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const cookieStore = cookies();
  const impersonateFestivalId = cookieStore.get("festos_impersonate_festival")?.value;
  const isImpersonating = impersonateFestivalId === params.festivalId;

  let hasAccess = false;
  let platformUser = null;

  if (isImpersonating) {
    platformUser = await prisma.platformUser.findUnique({ where: { userId: session.user.id } });
    if (platformUser) hasAccess = true;
  }

  if (session.user.role === "SUPER_ADMIN") hasAccess = true;

  if (!hasAccess) {
    if (session.user.role === "ORGANIZER") {
      const orgProfile = await prisma.organizer.findUnique({ where: { userId: session.user.id } });
      if (!orgProfile) redirect("/unauthorized");
      const owns = await prisma.festivalOrganizer.findUnique({
        where: { festivalId_organizerId: { festivalId: params.festivalId, organizerId: orgProfile.id } }
      });
      if (!owns) redirect("/unauthorized");
      hasAccess = true;
    } else {
      const isStaff = await prisma.staffMember.findFirst({
        where: { festivalId: params.festivalId, userId: session.user.id, active: true }
      });
      if (isStaff) hasAccess = true;
    }
    if (!hasAccess) redirect("/unauthorized");
  }

  const festival = await prisma.festival.findUnique({ where: { id: params.festivalId } });
  if (!festival) redirect("/unauthorized");

  if (festival.suspended && !platformUser && session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="dark min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Festival Suspended</h1>
          <p className="text-muted-foreground">Access has been restricted by platform administrators.</p>
          {festival.suspendedReason && (
            <div className="p-4 bg-muted rounded-xl border text-left text-sm">
              <span className="font-bold">Reason:</span> {festival.suspendedReason}
            </div>
          )}
          <p className="text-muted-foreground text-sm">Contact support@festos.app for assistance.</p>
        </div>
      </div>
    );
  }

  const userName = session.user.name || (session.user as any).firstName || "Organizer";

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col w-full">
      {isImpersonating && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-xs sm:text-sm font-bold flex justify-center items-center gap-2 z-50">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="truncate">Impersonating {festival.name} as Support Agent. All actions are audited.</span>
          <form action="/api/impersonate/stop" method="POST" className="ml-2 shrink-0">
            <button type="submit" className="underline hover:opacity-80">Stop</button>
          </form>
        </div>
      )}

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
          <DashboardSidebar festival={festival} />
        </div>

        {/* Main content column */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <OrganizerHeader
            festivalName={festival.name}
            userName={userName}
            festival={festival}
            mobileSidebar={<DashboardSidebar festival={festival} />}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
