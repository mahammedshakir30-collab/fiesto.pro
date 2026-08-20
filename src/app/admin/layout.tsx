import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const platformUser = await prisma.platformUser.findUnique({ where: { userId: session.user.id } });
  if (!platformUser && session.user.role !== "SUPER_ADMIN") redirect("/festivals");

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col w-full">
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
          <AdminSidebar />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <AdminHeader mobileSidebar={<AdminSidebar />} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
