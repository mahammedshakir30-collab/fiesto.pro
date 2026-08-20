'use client';

import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Download, Globe, Home, Trash } from "lucide-react";
import { togglePublish, toggleFeatured, deleteTemplate } from "@/actions/templates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TemplateActions({ template }: { template: any }) {
  const router = useRouter();

  const handleTogglePublish = async () => {
    try {
      await togglePublish(template.id, !template.published);
      toast.success(template.published ? "Unpublished from website" : "Published to website");
      router.refresh();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFeatured(template.id, !template.featuredOnHome);
      toast.success(template.featuredOnHome ? "Removed from homepage" : "Featured on homepage");
      router.refresh();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this poster?")) return;
    try {
      await deleteTemplate(template.id);
      toast.success("Poster deleted");
      router.refresh();
    } catch (e) {
      toast.error("Failed to delete poster");
    }
  };

  return (
    <>
      <a href={template.outputImageUrl} download={`${template.name}.png`}>
        <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download Image</DropdownMenuItem>
      </a>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleTogglePublish}>
        <Globe className="w-4 h-4 mr-2" /> {template.published ? 'Unpublish' : 'Publish to Gallery'}
      </DropdownMenuItem>
      {template.published && (
        <DropdownMenuItem onClick={handleToggleFeatured}>
          <Home className="w-4 h-4 mr-2" /> {template.featuredOnHome ? 'Remove from Home' : 'Feature on Home'}
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
        <Trash className="w-4 h-4 mr-2" /> Delete
      </DropdownMenuItem>
    </>
  );
}
