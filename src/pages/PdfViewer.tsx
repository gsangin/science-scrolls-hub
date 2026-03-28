import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// Using react-pdf built-in styles is not necessary if we disable the layers
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const LazyPage = ({ pageNumber, width, scale, onVisible }: { pageNumber: number; width: number; scale: number; onVisible: (page: number, isVisible: boolean) => void }) => {
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const renderObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsRendered(true); renderObserver.disconnect(); } },
      { rootMargin: "600px" }
    );
    renderObserver.observe(el);

    const activeObserver = new IntersectionObserver(
      ([entry]) => { onVisible(pageNumber, entry.isIntersecting); },
      { threshold: 0.1 }
    );
    activeObserver.observe(el);

    return () => {
      renderObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [pageNumber, onVisible]);

  const renderWidth = width * scale;

  return (
    <div ref={ref} id={`page-${pageNumber}`} style={{ minHeight: renderWidth * 1.4 }} className="flex justify-center mb-4 transition-all">
      {isRendered ? (
        <div className="relative select-none" style={{ width: renderWidth }} onContextMenu={(e) => e.preventDefault()}>
          <Page 
            pageNumber={pageNumber} 
            width={renderWidth} 
            className="shadow-md bg-white" 
            loading="" 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            customTextRenderer={() => ""}
          />
          {/* Transparent overlay to prevent right clicking and IDM hover menus on the canvas */}
          <div className="absolute inset-0 z-10 bg-transparent" />
        </div>
      ) : (
        <div style={{ width: renderWidth }} className="flex items-center justify-center bg-card/50 shadow-md">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

const PdfViewer = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Document";
  const downloadable = searchParams.get("downloadable") === "1";

  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [scale, setScale] = useState(1.0);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());

  const handlePageVisibility = useCallback((page: number, isVisible: boolean) => {
    setVisiblePages(prev => {
      const next = new Set(prev);
      if (isVisible) next.add(page);
      else next.delete(page);
      return next;
    });
  }, []);

  const currentPage = visiblePages.size > 0 ? Math.min(...Array.from(visiblePages)) : 1;

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const fitToWidth = () => setScale(1.0);

  const handleDownload = () => {
    if (!pdfData) {
      const link = document.createElement("a");
      link.href = url.includes("?") ? `${url}&download=` : `${url}?download=`;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const blobUrl = URL.createObjectURL(pdfData);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
  }, []);

  useEffect(() => {
    if (!url) return;
    
    // Fetch manually as blob to prevent IDM from cleanly intercepting pdf.js worker requests
    const abortCtrl = new AbortController();
    fetch(url, {
      signal: abortCtrl.signal,
      headers: { 'Accept': 'application/pdf, application/octet-stream' }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch document");
        return res.blob();
      })
      .then(blob => setPdfData(blob))
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(true);
          setLoading(false);
        }
      });
      
    return () => abortCtrl.abort();
  }, [url]);

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) setContainerWidth(entry.contentRect.width);
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
      <header className="flex flex-col sm:flex-row items-center gap-3 border-b border-border px-4 py-3 sticky top-0 bg-background z-10">
        <div className="flex items-center w-full sm:w-auto flex-1 gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.close()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-lg font-semibold text-foreground truncate flex-1 md:flex-none md:max-w-[200px] lg:max-w-md">
            {title}
          </h1>
        </div>

        {/* PDF Toolbar */}
        {numPages > 0 && !error && (
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl p-1 w-full sm:w-auto justify-center mx-auto shadow-sm border border-border/50">
            <span className="text-sm font-medium text-muted-foreground px-3 whitespace-nowrap">
              {currentPage} / {numPages}
            </span>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-sm" onClick={zoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-semibold w-12 text-center select-none">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-sm" onClick={zoomIn} disabled={scale >= 3.0}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-sm" onClick={fitToWidth} title="Fit to width">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-end w-full sm:w-auto flex-1">
          {downloadable && (
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!pdfData && loading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </header>

      <div ref={measuredRef} className="flex-1 overflow-auto flex justify-center bg-muted/30 p-2 sm:p-4">
        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            className={`flex flex-col items-center gap-2 ${loading || error ? "hidden" : ""}`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <LazyPage 
                key={i} 
                pageNumber={i + 1} 
                width={pageWidth} 
                scale={scale} 
                onVisible={handlePageVisibility} 
              />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
