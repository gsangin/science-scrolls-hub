import { memo, useMemo, useState } from "react";
import { FileText, BookOpen, Calendar, Trash2, Pencil } from "lucide-react";
import type { Resource } from "@/lib/data";
import { classLevelOptions, physicsPortions, chemistryPortions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import EditResourceDialog from "@/components/EditResourceDialog";

interface ResourceItemProps {
  resource: Resource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdated?: () => void;
}

// Pre-combine once at module level — never re-created
const allPortions = [...physicsPortions, ...chemistryPortions];

const ResourceItem = memo(({ resource, isAdmin, onDelete, onUpdated }: ResourceItemProps) => {
  const [editOpen, setEditOpen] = useState(false);

  // Only recomputed when file_path changes
  const publicUrl = useMemo(
    () => supabase.storage.from("study-materials").getPublicUrl(resource.file_path).data.publicUrl,
    [resource.file_path]
  );

  const viewerUrl = useMemo(
    () => `/view?url=${encodeURIComponent(publicUrl)}&title=${encodeURIComponent(resource.title)}&downloadable=${resource.downloadable ? "1" : "0"}`,
    [publicUrl, resource.title, resource.downloadable]
  );

  const classLabel = useMemo(
    () => classLevelOptions.find(o => o.value === resource.class_level)?.label ?? `Class ${resource.class_level}`,
    [resource.class_level]
  );

  const portionLabel = useMemo(
    () => resource.portion ? (allPortions.find(p => p.value === resource.portion)?.label ?? resource.portion) : null,
    [resource.portion]
  );

  const formattedDate = useMemo(
    () => new Date(resource.created_at).toLocaleDateString(),
    [resource.created_at]
  );

  const isNotes = resource.type === "notes";

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)]">
          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${isNotes ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"}`}>
            {isNotes ? <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => window.open(viewerUrl, "_blank")}
              className="font-heading font-semibold text-sm sm:text-base text-card-foreground truncate block hover:text-primary hover:underline transition-colors text-left max-w-full"
            >
              {resource.title}
            </button>
            <div className="mt-0.5 sm:mt-1 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span className="capitalize">{resource.type}</span>
              <span>•</span>
              <span>{classLabel}</span>
              {portionLabel && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{portionLabel}</span>
                </>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditOpen(true)} title="Edit">
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={() => onDelete(resource.id)}>
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <EditResourceDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          resource={resource}
          onUpdated={onUpdated ?? (() => {})}
        />
      )}
    </>
  );
});

ResourceItem.displayName = "ResourceItem";

export default ResourceItem;
