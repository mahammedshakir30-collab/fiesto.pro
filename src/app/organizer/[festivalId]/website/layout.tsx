import { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WebsiteLayout({ 
  children, 
  params 
}: { 
  children: ReactNode, 
  params: { festivalId: string } 
}) {
  const tabs = [
    { label: "Overview", href: `/organizer/${params.festivalId}/website` },
    { label: "Analytics", href: `/organizer/${params.festivalId}/website/analytics` },
    { label: "Domains", href: `/organizer/${params.festivalId}/website/domains` },
    { label: "Visibility", href: `/organizer/${params.festivalId}/website/visibility` },
    { label: "Homepage Content", href: `/organizer/${params.festivalId}/website/homepage-content` },
    { label: "Images", href: `/organizer/${params.festivalId}/website/images` },
    { label: "Theme Customizer", href: `/organizer/${params.festivalId}/website/theme` },
    { label: "Gallery", href: `/organizer/${params.festivalId}/website/gallery` },
    { label: "Downloads", href: `/organizer/${params.festivalId}/website/downloads` },
    { label: "News", href: `/organizer/${params.festivalId}/website/news` },
    { label: "Results Layout", href: `/organizer/${params.festivalId}/website/results-layout` },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold font-heading">Website Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your public festival site, branding, content, and visibility.</p>
        </div>
        <div className="px-6 flex gap-4 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <Link 
              key={tab.label}
              href={tab.href}
              className="px-1 py-3 text-sm font-medium border-b-2 border-transparent hover:border-border hover:text-foreground text-muted-foreground whitespace-nowrap"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-muted/20">
        {children}
      </div>
    </div>
  );
}
