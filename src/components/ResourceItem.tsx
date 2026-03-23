import { FileText, BookOpen, Calendar, Trash2, Download, Maximize2 } from "lucide-react";
import type { Resource } from "@/lib/data";
import { classLevelOptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ResourceItemProps {
  resource: Resource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

const ResourceItem = ({ resource, isAdmin, onDelete }: ResourceItemProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const publicUrl = supabase.storage
    .from("study-materials")
    .getPublicUrl(resource.file_path).data.publicUrl;

  const viewerUrl = `/view?url=${encodeURIComponent(publicUrl)}&title=${encodeURIComponent(resource.title)}`;

  const handleDownload = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="group flex items-center gap-4 p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)]">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          resource.type === "notes" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"
        }`}>
          {resource.type === "notes" ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setPreviewOpen(prev => !prev)}
            className="font-heading font-semibold text-card-foreground truncate block hover:text-primary hover:underline transition-colors text-left"
          >
            {resource.title}
          </button>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="capitalize">{resource.type}</span>
            <span>•</span>
            <span>{classLevelOptions.find(o => o.value === resource.class_level)?.label || `Class ${resource.class_level}`}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(resource.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(resource.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div
        className="border-t border-border overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: previewOpen ? "600px" : "0px",
          opacity: previewOpen ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40">
          <span className="text-sm text-muted-foreground font-medium">Preview</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary gap-1.5"
            onClick={() => window.open(viewerUrl, "_blank")}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Full Screen
          </Button>
        </div>
        {previewOpen && (
          <iframe
            src={publicUrl}
            title={resource.title}
            className="w-full border-0"
            style={{ height: "500px" }}
          />
        )}
      </div>
    </div>
  );
};

export default ResourceItem;
