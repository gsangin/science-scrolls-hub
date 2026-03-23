import { FileText, BookOpen, Calendar, Trash2 } from "lucide-react";
import type { Resource } from "@/lib/data";
import { Button } from "@/components/ui/button";

interface ResourceItemProps {
  resource: Resource;
  onDelete: (id: string) => void;
}

const ResourceItem = ({ resource, onDelete }: ResourceItemProps) => {
  return (
    <div className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        resource.type === "notes" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"
      }`}>
        {resource.type === "notes" ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-card-foreground truncate">{resource.title}</h4>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="capitalize">{resource.type}</span>
          <span>•</span>
          <span>Class {resource.classLevel}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(resource.uploadedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(resource.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ResourceItem;
