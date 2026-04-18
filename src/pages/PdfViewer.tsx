import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface LazyPageProps {
  pageNumber: number;
  width: number;
}

const LazyPage = memo(({ pageNumber, width }: LazyPageProps) => {
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRendered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: width * 1.4 }} className="flex justify-center mb-3">
      {isRendered ? (
        <div
          className="relative select-none"
          style={{ width }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            className="shadow-sm bg-white"
            loading=""
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
          <div className="absolute inset-0 z-10 bg-transparent" />
        </div>
      ) : (
        <div
          style={{ width, height: width * 1.4 }}
          className="flex items-center justify-center bg-card/50 shadow-sm"
          role="status"
        >
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
});

LazyPage.displayName = "LazyPage";

const PdfViewer = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Document";
  const downloadable = searchParams.get("downloadable") === "1";

  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/pdf, application/octet-stream" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.blob();
      })
      .then((blob) => setPdfData(blob))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });
    return () => ctrl.abort();
  }, [url]);

  const handleDownload = useCallback(() => {
    if (!pdfData) return;
    const blobUrl = URL.createObjectURL(pdfData);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, [pdfData, title]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track container width for responsive page rendering
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    setContainerWidth(node.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(node);
    return () => ro.disconnect();
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
      {/* Minimal header — back + title + optional download */}
      <header className="flex items-center gap-2 border-b border-border px-3 py-2 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => window.close()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-heading text-sm sm:text-base font-semibold text-foreground truncate flex-1">
          {title}
        </h1>
        {downloadable && (
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!pdfData}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </header>

      {/* Document area */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-muted/30 p-2 sm:p-4">
        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        )}
        {error && !pdfData && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-muted-foreground">Failed to load document.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
        {pdfData && (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            className={`flex flex-col items-center gap-0 w-full ${loading || error ? "hidden" : ""}`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <LazyPage key={i + 1} pageNumber={i + 1} width={pageWidth} />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
