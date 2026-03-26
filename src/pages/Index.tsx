import { useState, useMemo, useEffect, useCallback } from "react";
import { Upload, BookOpen, Search, GraduationCap, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectCard from "@/components/SubjectCard";
import ResourceItem from "@/components/ResourceItem";
import PortionAccordion from "@/components/PortionAccordion";
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
  const [classFilter, setClassFilter] = useState("12");
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
      if (r.class_level !== classFilter) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [resources, selectedSubject, classFilter, search]);

  const handleDelete = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;
    await supabase.storage.from("study-materials").remove([resource.file_path]);
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (!error) {
      setResources(prev => prev.filter(r => r.id !== id));
      toast({ title: "Resource deleted", variant: "destructive" });
    }
  };

  const handlePreviewToggle = (id: string) => {
    setOpenPreviewId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-primary px-4 sm:px-6 py-10 sm:py-16 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/40" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-accent/20" />
        </div>
        {user && (
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between">
            <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/admin-settings")}>
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={signOut}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
            <GraduationCap className="w-4 h-4" />
            Class 11 & 12 Science
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Science Scrolls
          </h1>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-primary-foreground/80">
            Your Science Companion
          </p>
          {user && (
            <Button size="lg" onClick={() => setUploadOpen(true)} className="mt-6 sm:mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg">
              <Upload className="w-5 h-5 mr-2" />
              Upload Resource
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Subject Grid */}
        <section>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-5">Subjects</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            {subjectsWithCounts.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubject === subject.id}
                onClick={() => setSelectedSubject(prev => (prev === subject.id ? null : subject.id))}
              />
            ))}
          </div>
        </section>

        {/* Filters & Resource List */}
        <section className="mt-8 sm:mt-10">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              {selectedSubject
                ? `${subjects.find(s => s.id === selectedSubject)?.name} Resources`
                : "All Resources"}
            </h2>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <Tabs value={classFilter} onValueChange={setClassFilter}>
                <TabsList className="w-max">
                  {classLevelOptions.map((opt) => (
                    <TabsTrigger key={opt.value} value={opt.value} className="text-xs sm:text-sm px-2.5 sm:px-3">{opt.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="relative mt-3 sm:mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3">
            {filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-12 sm:py-16 text-center px-4">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-heading font-semibold text-muted-foreground">
                  No resources yet
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground/70">
                  {user ? "Upload your first notes or textbook to get started" : "Check back soon for study materials"}
                </p>
                {user && (
                  <Button variant="outline" className="mt-4" onClick={() => setUploadOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>
            ) : selectedSubject === "physics" && (classFilter === "11" || classFilter === "12") ? (
              <PortionAccordion
                resources={filteredResources}
                isAdmin={!!user}
                onDelete={handleDelete}
                onUpdated={fetchResources}
              />
            ) : (
              filteredResources.map(resource => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  isAdmin={!!user}
                  onDelete={handleDelete}
                  onUpdated={fetchResources}
                  isPreviewOpen={openPreviewId === resource.id}
                  onPreviewToggle={handlePreviewToggle}
                />
              ))
            )}
          </div>
        </section>
      </main>

      <AuthorFooter />

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
