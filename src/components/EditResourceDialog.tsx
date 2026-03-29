import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { subjects, classLevelOptions, physicsPortions, chemistryPortions, type Resource } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditResourceDialogProps {
  open: boolean;
  onClose: () => void;
  resource: Resource;
  onUpdated: () => void;
}

const EditResourceDialog = ({ open, onClose, resource, onUpdated }: EditResourceDialogProps) => {
  const [title, setTitle] = useState(resource.title);
  const [subject, setSubject] = useState(resource.subject);
  const [classLevel, setClassLevel] = useState(resource.class_level);
  const [type, setType] = useState<"notes" | "textbook">(resource.type as "notes" | "textbook");
  const [portion, setPortion] = useState(resource.portion || "");
  const [downloadable, setDownloadable] = useState(resource.downloadable);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const showPortions = subject === "physics" || subject === "chemistry";
  const currentPortions = subject === "physics" ? physicsPortions : chemistryPortions;

  const handleSave = async () => {
    if (!title || !subject) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("resources")
        .update({
          title,
          subject,
          class_level: classLevel,
          type,
          portion: showPortions && portion ? portion : null,
          downloadable,
        })
        .eq("id", resource.id);

      if (error) throw error;
      toast({ title: "Resource updated!" });
      onUpdated();
      onClose();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Title</Label>
            <Input id="editTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setPortion(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classLevel} onValueChange={(v) => { setClassLevel(v); setPortion(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classLevelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showPortions && (
            <div className="space-y-2">
              <Label>Portion</Label>
              <Select value={portion} onValueChange={setPortion}>
                <SelectTrigger><SelectValue placeholder="Select portion" /></SelectTrigger>
                <SelectContent>
                  {physicsPortions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "notes" | "textbook")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="textbook">Textbook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-sm font-medium">Allow Download</Label>
              <p className="text-xs text-muted-foreground">Users can download this file</p>
            </div>
            <Switch checked={downloadable} onCheckedChange={setDownloadable} />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={!title || !subject || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditResourceDialog;
