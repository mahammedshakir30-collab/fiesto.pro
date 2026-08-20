import { getSiteSettings } from "@/actions/website";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { PublicSitePasswordForm } from "./PublicSitePasswordForm";
import { PublicSiteNavbar } from "./PublicSiteNavbar";

export default async function PublicFestivalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  // We need to look up the festival ID by slug to get the settings
  // The website module assumes we have settings, so we can fetch it via prisma directly
  const { prisma } = await import("@/lib/prisma");

  const festival = await prisma.festival.findUnique({
    where: { slug: params.slug },
    include: {
      siteSettings: true,
      sitePages: {
        where: { visible: true },
        orderBy: { navOrder: 'asc' }
      }
    }
  });

  if (!festival) {
    notFound();
  }

  const settings = festival.siteSettings;

  if (!settings) {
    // If no settings exist yet, we treat it as live (fallback) but unstyled
    return <>{children}</>;
  }

  // Handle Draft state
  if (!settings.published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-color-base p-6 text-center">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold font-heading mb-4 text-color-primary">{festival.name}</h1>
          <p className="text-xl text-foreground/80 mb-8">Coming Soon</p>
          <div className="w-16 h-1 bg-color-primary mx-auto rounded-full" />
        </div>
      </div>
    );
  }

  // Handle Password Protection
  if (settings.passwordProtected && settings.sitePassword) {
    const cookieStore = cookies();
    const siteAuth = cookieStore.get(`festos_site_auth_${festival.id}`);

    // In a real app, this should be securely hashed and signed.
    // For this demonstration, we just check if the cookie value matches the password.
    if (siteAuth?.value !== settings.sitePassword) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-color-base p-6">
          <PublicSitePasswordForm festivalId={festival.id} festivalName={festival.name} expectedPassword={settings.sitePassword} />
        </div>
      );
    }
  }

  const theme = settings.themeJson as any;
  const customStyles = `
    .festival-theme-${festival.id} {
      ${theme.primary ? `--color-primary: ${theme.primary};` : ''}
      ${theme.secondary ? `--color-accent: ${theme.secondary};` : ''}
      ${theme.background ? `--color-base: ${theme.background};` : ''}
      ${theme.text ? `--foreground: ${theme.text};` : ''}
      ${theme.font ? `--font-syne: "${theme.font}", sans-serif; --font-urbanist: "${theme.font}", sans-serif;` : ''}
    }
  `;

  return (
    <div className={`festival-theme-${festival.id} min-h-screen flex flex-col w-full bg-color-base text-foreground`} style={{
      fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined
    }}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <PublicSiteNavbar festival={festival} pages={festival.sitePages} theme={theme} />
      {/* Dynamic children */}
      {children}
    </div>
  );
}
