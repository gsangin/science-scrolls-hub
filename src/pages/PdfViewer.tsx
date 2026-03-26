import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PdfViewer = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Document";
  const downloadable = searchParams.get("downloadable") === "1";
  const [iframeError, setIframeError] = useState(false);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document URL provided.</p>
      </div>
    );
  }

  // Use direct URL for browser-native PDF rendering (no size limit)
  // Fall back to Google Viewer for non-PDF files
  const isPdf = url.toLowerCase().includes(".pdf");
  const viewerUrl = isPdf && !iframeError
    ? url
    : `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-lg font-semibold text-foreground truncate flex-1">
          {title}
        </h1>
        {downloadable && (
          <Button variant="outline" size="sm" asChild>
            <a href={url} download>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        )}
      </header>
      <div className="flex-1">
        <iframe
          src={viewerUrl}
          title={title}
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 57px)" }}
          sandbox="allow-scripts allow-same-origin allow-popups"
          onError={() => isPdf && setIframeError(true)}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
