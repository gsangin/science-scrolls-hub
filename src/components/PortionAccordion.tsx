import { memo, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { physicsPortions, chemistryPortions, type Resource } from "@/lib/data";
import ResourceItem from "@/components/ResourceItem";

interface PortionAccordionProps {
  resources: Resource[];
  subject: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdated?: () => void;
}

const PortionAccordion = memo(({ resources, subject, isAdmin, onDelete, onUpdated }: PortionAccordionProps) => {
  const [openPortions, setOpenPortions] = useState<string[]>([]);

  const togglePortion = (portion: string) => {
    setOpenPortions(prev =>
      prev.includes(portion) ? prev.filter(p => p !== portion) : [...prev, portion]
    );
  };

  const targetPortions = subject === "physics" ? physicsPortions : chemistryPortions;

  const portionsWithResources = useMemo(() =>
    targetPortions.map(p => ({
      ...p,
      resources: resources.filter(r => r.portion === p.value),
    })),
    [resources, targetPortions]
  );

  const untagged = useMemo(() =>
    resources.filter(r => !r.portion),
    [resources]
  );

  return (
    <div className="space-y-2">
      {portionsWithResources.map(portion => {
        const isOpen = openPortions.includes(portion.value);
        return (
          <div key={portion.value} className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              onClick={() => togglePortion(portion.value)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-heading font-semibold text-sm sm:text-base text-card-foreground">
                  {portion.label}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {portion.resources.length}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className="grid"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
                transition: "grid-template-rows 250ms ease, opacity 200ms ease",
              }}
            >
              <div className="overflow-hidden">
                <div className="px-2 sm:px-3 pb-2 sm:pb-3 space-y-2">
                  {portion.resources.length === 0 ? (
                    <p className="text-xs sm:text-sm text-muted-foreground py-3 text-center">
                      No resources in this portion yet
                    </p>
                  ) : (
                    portion.resources.map(resource => (
                      <ResourceItem
                        key={resource.id}
                        resource={resource}
                        isAdmin={isAdmin}
                        onDelete={onDelete}
                        onUpdated={onUpdated}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {untagged.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground px-1">Other</p>
          {untagged.map(resource => (
            <ResourceItem
              key={resource.id}
              resource={resource}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
});

PortionAccordion.displayName = "PortionAccordion";

export default PortionAccordion;
