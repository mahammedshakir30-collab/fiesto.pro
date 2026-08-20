import React from "react";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";

export default async function VendorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { vendorId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const vendorProfile = await prisma.vendor.findUnique({
    where: { id: params.vendorId },
    include: { festival: true }
  });

  if (!vendorProfile) redirect("/unauthorized");
  if (session.user.role !== "SUPER_ADMIN" && vendorProfile.userId !== session.user.id) {
    redirect("/unauthorized");
  }

  const userName = session.user.name || (session.user as any).firstName || "Vendor";

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col w-full">
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
          <VendorSidebar vendor={vendorProfile as any} />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <OrganizerHeader
            festivalName={vendorProfile.festival.name}
            userName={userName}
            mobileSidebar={<VendorSidebar vendor={vendorProfile as any} />}
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
