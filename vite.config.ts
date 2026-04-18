import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    // Target modern browsers — smaller output, native ES modules
    target: "es2020",
    // Use esbuild (already default) with aggressive settings
    minify: "esbuild",
    // Inline small assets (icons/svgs) to eliminate round-trips
    assetsInlineLimit: 8192,
    // CSS code-splitting per chunk
    cssCodeSplit: true,
    // Remove console/debugger statements in production
    esbuildOptions: {
      drop: ["console", "debugger"],
      legalComments: "none",
    },
    rollupOptions: {
      output: {
        // Granular manual chunks keep initial bundle lean
        manualChunks: (id) => {
          // React core — cached across all routes
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/scheduler/")) {
            return "vendor-react";
          }
          // Router — one instance needed
          if (id.includes("node_modules/react-router-dom/") || id.includes("node_modules/@remix-run/")) {
            return "vendor-router";
          }
          // Data-fetching layer
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-query";
          }
          // Supabase SDK — large, rarely changes
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          // PDF renderer — heaviest dep, lazy-loaded via route
          if (id.includes("node_modules/react-pdf") || id.includes("node_modules/pdfjs-dist")) {
            return "vendor-pdf";
          }
          // Radix UI primitives — shared across all pages
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-ui";
          }
          // Everything else in node_modules → common vendor chunk
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
        // Stable file names for long-lived CDN caching
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Warn when a chunk exceeds 400 kB (before gzip)
    chunkSizeWarningLimit: 400,
    // Write to disk only what changed (incremental builds)
    reportCompressedSize: false,
  },
}));
