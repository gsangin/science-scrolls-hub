import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { subjects } from "@/lib/data";
import type { Resource } from "@/lib/data";

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (resource: Omit<Resource, "id" | "uploadedAt">) => void;
}

const UploadDialog = ({ open, onClose, onUpload }: UploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState<"11" | "12">("11");
  const [type, setType] = useState<"notes" | "textbook">("notes");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !fileName) return;
    onUpload({ title, subject, classLevel, type, fileName });
    setTitle("");
    setSubject("");
    setClassLevel("11");
    setType("notes");
    setFileName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Upload Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {fileName && (
              <p className="text-sm text-muted-foreground truncate">{fileName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kinematics Chapter Notes"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classLevel} onValueChange={(v) => setClassLevel(v as "11" | "12")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "notes" | "textbook")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="textbook">Textbook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={!title || !subject || !fileName}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Resource
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
