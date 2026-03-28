import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Ensure styles are imported for proper layout
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Standardizing the worker to match your package version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * LazyPage Component: Only renders the PDF page when it enters the viewport.
 * Uses a placeholder to maintain scroll position and prevent "jumping."
 */
const LazyPage = ({ 
  pageNumber, 
  width, 
  onLoadSuccess 
}: { 
  pageNumber: number; 
  width: number;
  onLoadSuccess?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" } // Starts loading 400px before it scrolls into view
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Standard A4 Aspect Ratio is ~1.41
  const minHeight = width > 0 ? width * 1.41 : 800;

  return (
    <div 
      ref={containerRef} 
      style={{ minHeight }} 
      className="w-full flex items-center justify-center bg-white mb-6 shadow-sm rounded-lg overflow-hidden border border-border"
    >
      {isVisible ? (
        <Page
          pageNumber={pageNumber}
          width={width}
          onLoadSuccess={onLoadSuccess}
          // CRITICAL FOR DOWNLOAD PREVENTION:
          renderTextLayer={false}       // IDM cannot "see" text to trigger a download
          renderAnnotationLayer={false} // Prevents extraction of links
          loading={
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Rendering Page {pageNumber}...</span>
            </div>
          }
        />
      ) : (
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
};

export default function PdfViewer() {
  const [searchParams] = useSearchParams();
  const fileUrl = searchParams.get("file");
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. STOP IDM: Fetch file as a Blob so there is no direct .pdf URL for IDM to sniff
  useEffect(() => {
    if (!fileUrl) return;

    const fetchFile = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch document");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        setError("Could not load the PDF. It may have been moved or deleted.");
        console.error(err);
      }
    };

    fetchFile();

    // Cleanup the blob URL when component unmounts to save memory
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [fileUrl]);

  // 2. Responsive Width: Adjusts PDF size based on screen width (Mobile Friendly)
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const padding = window.innerWidth < 768 ? 20 : 80;
        setContainerWidth(containerRef.current.offsetWidth - padding);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Viewer
            </Link>
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            {numPages ? `${numPages} Pages` : "Loading..."}
          </div>
          <div className="w-[80px]" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* PDF Container */}
      <main 
        ref={containerRef}
        className="flex-1 max-w-5xl mx-auto w-full p-2 md:p-6"
        onContextMenu={(e) => e.preventDefault()} // Blocks Right-Click
      >
        <Document
          file={blobUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Preparing Science Scrolls...</p>
            </div>
          }
        >
          {numPages && containerWidth > 0 &&
            Array.from(new Array(numPages), (_, i) => (
              <LazyPage 
                key={`page_${i + 1}`} 
                pageNumber={i + 1} 
                width={containerWidth} 
              />
            ))
          }
        </Document>
      </main>

      {/* Simple Protection Overlay Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .react-pdf__Page__canvas {
          max-width: 100% !important;
          height: auto !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
      `}} />
    </div>
  );
}
