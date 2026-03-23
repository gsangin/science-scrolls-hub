import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/admin");
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("author_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        setSettingsId(data.id);
        setName(data.name);
        setDescription(data.description || "");
        setPhotoUrl(data.photo_url || null);
        setShowPhoto(data.show_photo);
      }
    };
    fetch();
  }, [user, navigate]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const filePath = `author_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("author-photos")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("author-photos")
        .getPublicUrl(filePath);
      setPhotoUrl(urlData.publicUrl);
      toast({ title: "Photo uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setShowPhoto(false);
  };

  const handleSave = async () => {
    if (!settingsId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("author_settings")
        .update({
          name,
          description,
          photo_url: photoUrl,
          show_photo: showPhoto,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);
      if (error) throw error;
      toast({ title: "Settings saved!" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-xl font-bold text-foreground">Author Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="authorName">Author Name</Label>
          <Input
            id="authorName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Author name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorDesc">Description</Label>
          <Textarea
            id="authorDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short bio..."
            rows={4}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <Label>Author Photo</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show photo</span>
              <Switch
                checked={showPhoto}
                onCheckedChange={setShowPhoto}
                disabled={!photoUrl}
              />
            </div>
          </div>

          {photoUrl && (
            <div className="flex items-center gap-4">
              <img
                src={photoUrl}
                alt="Author"
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
              <Button variant="outline" size="sm" onClick={handleRemovePhoto}>
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="photoUpload" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="w-4 h-4" />
                {photoUrl ? "Change photo" : "Upload photo"}
              </div>
            </Label>
            <Input
              id="photoUpload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </main>
    </div>
  );
};

export default AdminSettings;
