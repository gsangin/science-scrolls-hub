import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const PdfViewer = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Document";
  const downloadable = searchParams.get("downloadable") === "1";

  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  // Measure container width for responsive page rendering
  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(node);
      setContainerWidth(node.clientWidth);
    }
  }, []);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document URL provided.</p>
      </div>
    );
  }

  const pageWidth = Math.min(containerWidth - 16, 1200);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sticky top-0 bg-background z-10">
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

      <div ref={measuredRef} className="flex-1 overflow-auto flex justify-center bg-muted/30 p-2 sm:p-4">
        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-muted-foreground">Failed to load document.</p>
            <Button variant="outline" onClick={() => { setError(false); setLoading(true); }}>
              Retry
            </Button>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          className={`flex flex-col items-center gap-2 ${loading || error ? "hidden" : ""}`}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={pageWidth}
              className="shadow-md"
              loading=""
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
