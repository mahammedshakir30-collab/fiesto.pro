import React from "react";
import { LeaderSidebar } from "@/components/leader/LeaderSidebar";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LeaderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { festivalId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/signin");

  const team = session.user.role === "SUPER_ADMIN"
    ? await prisma.team.findFirst({ where: { festivalId: params.festivalId } })
    : await prisma.team.findFirst({ where: { festivalId: params.festivalId, leaderId: session.user.id } });

  if (!team) redirect("/portal");

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId },
    select: { name: true, id: true }
  });

  const userName = session.user.name || (session.user as any).firstName || "Leader";

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col w-full">
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
          <LeaderSidebar festivalId={params.festivalId} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <OrganizerHeader
            festivalName={festival?.name || "Leader Portal"}
            userName={userName}
            mobileSidebar={<LeaderSidebar festivalId={params.festivalId} />}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
