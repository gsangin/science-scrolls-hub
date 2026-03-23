import { useState, useMemo, useEffect, useCallback } from "react";
import { Upload, BookOpen, Search, GraduationCap, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectCard from "@/components/SubjectCard";
import ResourceItem from "@/components/ResourceItem";
import UploadDialog from "@/components/UploadDialog";
import AuthorFooter from "@/components/AuthorFooter";
import { subjects, classLevelOptions, type Resource } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  

  const fetchResources = useCallback(async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setResources(data as Resource[]);
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const subjectsWithCounts = useMemo(() =>
    subjects.map(s => ({
      ...s,
      resourceCount: resources.filter(r => r.subject === s.id).length,
    })),
    [resources]
  );

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      if (selectedSubject && r.subject !== selectedSubject) return false;
      if (classFilter !== "all" && r.class_level !== classFilter) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [resources, selectedSubject, classFilter, search]);

  const handleDelete = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;

    // Delete file from storage
    await supabase.storage.from("study-materials").remove([resource.file_path]);
    // Delete record from DB
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (!error) {
      setResources(prev => prev.filter(r => r.id !== id));
      toast({ title: "Resource deleted", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-primary px-6 py-16 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/40" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-accent/20" />
        </div>
        {user && (
          <div className="absolute right-6 top-6 flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/admin-settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            </Button>
          </div>
        )}
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm">
            <GraduationCap className="w-4 h-4" />
            Class 11 & 12 Science
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Science Scrolls
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Your Science Companion
          </p>
          {user && (
            <Button
              size="lg"
              onClick={() => setUploadOpen(true)}
              className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Resource
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Subject Grid */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-5">Subjects</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {subjectsWithCounts.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubject === subject.id}
                onClick={() =>
                  setSelectedSubject(prev => (prev === subject.id ? null : subject.id))
                }
              />
            ))}
          </div>
        </section>

        {/* Filters & Resource List */}
        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {selectedSubject
                ? `${subjects.find(s => s.id === selectedSubject)?.name} Resources`
                : "All Resources"}
            </h2>
            <div className="flex items-center gap-3">
              <Tabs value={classFilter} onValueChange={setClassFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {classLevelOptions.map((opt) => (
                    <TabsTrigger key={opt.value} value={opt.value}>{opt.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="mt-5 space-y-3">
            {filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-heading font-semibold text-muted-foreground">
                  No resources yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {user
                    ? "Upload your first notes or textbook to get started"
                    : "Check back soon for study materials"}
                </p>
                {user && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setUploadOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>
            ) : (
              filteredResources.map(resource => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  isAdmin={!!user}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-6 py-8 mt-10">
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="font-heading text-lg font-semibold text-foreground">About the Author</h3>
          <p className="mt-2 text-muted-foreground">
            Created by <span className="font-semibold text-primary">Sangin Ghimire</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Dedicated to making quality science education accessible for all students.
          </p>
        </div>
      </footer>

      {user && (
        <UploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={fetchResources}
        />
      )}
    </div>
  );
};

export default Index;
