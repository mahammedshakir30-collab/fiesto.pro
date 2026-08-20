import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, Store, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin");
  }

  const user = session.user;
  // 1. Super Admin Routing - ONLY exactly two users
  const SUPER_ADMIN_EMAILS = [
    "mahammedshakir30@gmail.com",
    "getfiesto@gmail.com"
  ];

  if (SUPER_ADMIN_EMAILS.includes(user.email || "") || (user as any).platformRole === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // 2. Organizer Routing
  const isOrganizer = user.role === "ORGANIZER";
  const isVendor = user.role === "VENDOR";

  const portals: { title: string; description: string; href: string; icon: any; iconWrapperClass: string }[] = [];
  // Check if they have an organizer profile (even if their role isn't explicitly ORGANIZER, e.g. seeded admins)
  const organizer = await prisma.organizer.findUnique({
    where: { userId: user.id },
    include: {
      festivals: {
        include: { festival: true }
      }
    }
  });

  if (organizer && organizer.festivals.length > 0) {
    organizer.festivals.forEach(fo => {
      portals.push({
        title: fo.festival.name,
        description: fo.festival.location,
        href: `/organizer/${fo.festival.id}`,
        icon: Calendar,
        iconWrapperClass: "bg-color-primary/10 text-color-primary group-hover:bg-color-primary group-hover:text-white"
      });
    });
  }

  // 3. Vendor Routing
  if (isVendor) {
    const vendors = await prisma.vendor.findMany({
      where: { userId: user.id },
      include: { festival: true }
    });

    vendors.forEach(vendor => {
      portals.push({
        title: vendor.name,
        description: vendor.festival.name,
        href: `/vendor/${vendor.id}`,
        icon: Store,
        iconWrapperClass: "bg-color-accent/10 text-color-accent group-hover:bg-color-accent group-hover:text-white"
      });
    });
  }

  
  // 3.5 Team Leader Routing
  const teams = await prisma.team.findMany({
    where: { leaderId: user.id },
    include: { festival: true }
  });

  teams.forEach(team => {
    portals.push({
      title: team.name + " (Team)",
      description: team.festival.name,
      href: `/leader/${team.festivalId}`,
      icon: Compass,
      iconWrapperClass: "bg-color-success/10 text-color-success group-hover:bg-color-success group-hover:text-white"
    });
  });

  // 4. Attendee or Users without a specific setup route to Discover
  if (portals.length === 0) {
    redirect("/discover");
  }

  // If they only have one portal option, skip the selector
  if (portals.length === 1) {
    redirect(portals[0].href);
  }

  return (
    <div className="min-h-screen bg-background p-8 md:p-20 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Select your Workspace</h1>
          <p className="text-muted-foreground mt-2">You have access to multiple portals. Where would you like to go?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map(portal => (
            <Link key={portal.href} href={portal.href}>
              <Card className="hover:border-color-primary hover:shadow-soft transition-all cursor-pointer h-full group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${portal.iconWrapperClass}`}>
                    <portal.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{portal.title}</CardTitle>
                  <CardDescription>{portal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-bold flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                    Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
