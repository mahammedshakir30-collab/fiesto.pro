import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePosterModal } from "@/components/organizer/templates/CreatePosterModal";
import { TemplateActions } from "@/components/organizer/templates/TemplateActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ImageIcon, Globe, Home, Download } from "lucide-react";
import Image from "next/image";

export default async function TemplatesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId }
  });

  if (!festival) redirect("/dashboard");

  const templates = await prisma.template.findMany({
    where: { festivalId: params.festivalId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posters & Templates</h1>
          <p className="text-muted-foreground mt-1">Generate or upload promotional posters for your festival.</p>
        </div>
        <CreatePosterModal festivalId={params.festivalId} festivalData={festival} />
      </div>

      {templates.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No posters yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create an auto-generated poster in seconds or upload your own custom design.</p>
          <CreatePosterModal festivalId={params.festivalId} festivalData={festival} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col">
              <div className="aspect-[4/5] bg-muted relative group">
                <Image 
                  src={template.outputImageUrl} 
                  alt={template.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-opacity duration-300"
                  priority={false}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={template.outputImageUrl} download={`${template.name}.png`}>
                    <Button variant="secondary" size="icon" className="rounded-full"><Download className="w-4 h-4" /></Button>
                  </a>
                </div>
              </div>
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold line-clamp-1" title={template.name}>{template.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{template.mode === 'AUTO_GENERATED' ? 'Auto-generated' : 'Uploaded'}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <TemplateActions template={template} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {(template.published || template.featuredOnHome) && (
                <div className="px-4 pb-4 flex gap-2">
                  {template.published && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200"><Globe className="w-3 h-3 mr-1" /> Published</Badge>}
                  {template.featuredOnHome && <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"><Home className="w-3 h-3 mr-1" /> Featured</Badge>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
