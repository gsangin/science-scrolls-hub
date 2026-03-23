import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PdfViewer = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Document";

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document URL provided.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-lg font-semibold text-foreground truncate">
          {title}
        </h1>
      </header>
      <div className="flex-1">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 57px)" }}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
