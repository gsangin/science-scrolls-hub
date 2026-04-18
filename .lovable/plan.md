
The user reports a blank preview and wants the site responsive, fast, and lightweight. Let me investigate.

The console logs are empty (no errors captured), but the preview is blank. Let me reason about likely causes from the code I've already seen:

**Likely root causes of blank preview:**
1. `src/pages/Index.tsx` was edited multiple times recently (clickable title, conditional feedback section, portion accordions for all classes, request/comment per class). A syntax/JSX error there would crash the whole route since `/` renders `Index`. Suspense fallback would clear and React error boundary is missing → blank screen.
2. `src/pages/PdfViewer.tsx` was recently expanded with single-page mode, zoom, fit-to-width, page input — possible runtime error, but that's only on `/view`.
3. No top-level `ErrorBoundary` exists in `App.tsx` — any thrown render error = blank white page with no feedback.

I need to read the current `Index.tsx` and `PdfViewer.tsx` to confirm the actual breakage before planning fixes. I'll do that during execution. The plan below covers both the fix and the broader perf/responsiveness pass.

## Plan

### 1. Fix the blank preview
- Read `src/pages/Index.tsx` and `src/pages/PdfViewer.tsx` to find the runtime/JSX error introduced by recent edits and fix it.
- Add a global `ErrorBoundary` component wrapping `<Routes>` in `App.tsx` so future render errors show a readable message + reload button instead of a blank screen.
- Check dev-server logs for the actual stack trace to pinpoint the failing line.

### 2. Performance — use less browser CPU/memory
- **PDF viewer**: cap concurrent rendered pages (unmount pages far from viewport, not just defer mount), lower `assetsInlineLimit` impact, and use `pdfjs` `disableAutoFetch` + `disableStream: false` so only requested page ranges download.
- **Index page**: memoize `filteredResources`, debounce the search input (150 ms), virtualize long resource lists when count > 30.
- **Images / icons**: ensure `lucide-react` icons are tree-shaken (already are), audit for any large unused imports.
- **Query client**: keep current 15-min staleTime, add `structuralSharing: true` (default) and a single shared resources query key so subject/class switches don't refetch.
- **Fonts**: add `font-display: swap` and preconnect to Google Fonts in `index.html` to remove render-blocking.

### 3. Responsiveness pass
- Audit `Index.tsx` header, subject grid, and class selector at 320 / 375 / 414 / 768 widths — fix any horizontal overflow, ensure tap targets ≥ 40 px.
- PDF viewer header: collapse zoom/page controls into a compact toolbar that wraps on < 480 px instead of overflowing.
- Feedback card and AuthorFooter: ensure padding scales (`px-4 sm:px-6`) and text sizes use clamp-style Tailwind (`text-base sm:text-lg`).

### 4. Model note
The user asked to "use claude opus." Lovable does not currently expose Claude Opus as a selectable coding model — I'll proceed with the current Lovable model. If they meant Lovable AI inside their app, none is needed for this fix.

### Files to touch
- `src/pages/Index.tsx` — fix error, debounce search, memoize derived data
- `src/pages/PdfViewer.tsx` — fix any error, unmount far-offscreen pages, responsive toolbar
- `src/App.tsx` — wrap routes in ErrorBoundary
- `src/components/ErrorBoundary.tsx` — new
- `index.html` — font preconnect + display swap
