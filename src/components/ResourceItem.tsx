import { FileText, BookOpen, Calendar, Trash2, Download, Maximize2, X, Pencil } from "lucide-react";
import type { Resource } from "@/lib/data";
import { classLevelOptions, physicsPortions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import EditResourceDialog from "@/components/EditResourceDialog";

interface ResourceItemProps {
  resource: Resource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdated?: () => void;
  isPreviewOpen?: boolean;
  onPreviewToggle?: (id: string) => void;
}

const ResourceItem = ({ resource, isAdmin, onDelete, onUpdated, isPreviewOpen, onPreviewToggle }: ResourceItemProps) => {
  const [editOpen, setEditOpen] = useState(false);

  const [internalPreview, setInternalPreview] = useState(false);
  const previewOpen = isPreviewOpen !== undefined ? isPreviewOpen : internalPreview;

  const togglePreview = () => {
    if (onPreviewToggle) {
      onPreviewToggle(resource.id);
    } else {
      setInternalPreview(prev => !prev);
    }
  };

  const closePreview = () => {
    if (onPreviewToggle) {
      onPreviewToggle("");
    } else {
      setInternalPreview(false);
    }
  };

  const publicUrl = supabase.storage
    .from("study-materials")
    .getPublicUrl(resource.file_path).data.publicUrl;

  // Use Google Docs viewer for cross-browser PDF rendering
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(publicUrl)}&embedded=true`;

  const viewerUrl = `/view?url=${encodeURIComponent(publicUrl)}&title=${encodeURIComponent(resource.title)}&downloadable=${resource.downloadable ? "1" : "0"}`;

  const handleDownload = () => {
    window.open(viewerUrl, "_blank");
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)]">
          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${
            resource.type === "notes" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"
          }`}>
            {resource.type === "notes" ? <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={togglePreview}
              className="font-heading font-semibold text-sm sm:text-base text-card-foreground truncate block hover:text-primary hover:underline transition-colors text-left max-w-full"
            >
              {resource.title}
            </button>
            <div className="mt-0.5 sm:mt-1 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span className="capitalize">{resource.type}</span>
              <span>•</span>
              <span>{classLevelOptions.find(o => o.value === resource.class_level)?.label || `Class ${resource.class_level}`}</span>
              {resource.portion && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{physicsPortions.find(p => p.value === resource.portion)?.label || resource.portion}</span>
                </>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(resource.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditOpen(true)} title="Edit">
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              {resource.downloadable && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={() => onDelete(resource.id)}>
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
          {!isAdmin && resource.downloadable && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>

        <div
          className="border-t border-border overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: previewOpen ? "90vh" : "0px",
            opacity: previewOpen ? 1 : 0,
          }}
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-muted/40">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Preview</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs sm:text-sm text-muted-foreground hover:text-destructive gap-1" onClick={closePreview}>
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Close
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs sm:text-sm text-muted-foreground hover:text-primary gap-1" onClick={() => window.open(fullScreenViewerUrl, "_blank")}>
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Full Screen
              </Button>
            </div>
          </div>
          {previewOpen && (
            <iframe
              src={googleViewerUrl}
              title={resource.title}
              className="w-full border-0"
              style={{ height: "calc(90vh - 40px)" }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>
      </div>

      {isAdmin && (
        <EditResourceDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          resource={resource}
          onUpdated={onUpdated || (() => {})}
        />
      )}
    </>
  );
};

export default ResourceItem;
