// Secure PDF-serving edge function
// - Validates file path against traversal attacks
// - Looks up permissions server-side (source of truth)
// - Streams PDF inline with anti-IDM headers
// - Generic error responses (no internal leakage)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const jsonError = (status: number, message: string) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Strict allow-list: bucket layout is "<class>/<subject>/<uuid>.<ext>" (or similar).
// Allow only safe characters; explicitly reject ".." or "//" anywhere.
const SAFE_PATH = /^[A-Za-z0-9_\-./ ()]{1,512}$/;
const isSafePath = (p: string): boolean => {
  if (!p || typeof p !== "string") return false;
  if (!SAFE_PATH.test(p)) return false;
  if (p.includes("..")) return false;
  if (p.includes("//")) return false;
  if (p.startsWith("/") || p.startsWith(".")) return false;
  return true;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- 1. Extract & validate input ----
    let filePath: string | null = null;
    if (req.method === "GET") {
      const url = new URL(req.url);
      filePath = url.searchParams.get("file_path");
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        filePath = typeof body?.file_path === "string" ? body.file_path : null;
      } catch {
        return jsonError(400, "Invalid request");
      }
    } else {
      return jsonError(405, "Method not allowed");
    }

    if (!filePath || !isSafePath(filePath)) {
      return jsonError(400, "Invalid request");
    }

    // ---- 2. Build a Supabase client that respects the caller's auth context ----
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";

    // RLS-respecting client (uses caller's JWT if present)
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ---- 3. Server-side permission lookup (source of truth) ----
    // The `resources` table is publicly readable in this project (view-only access
    // for unauthenticated visitors is part of the product). The userClient still
    // enforces RLS for any rows that become protected later.
    const { data: resource, error: lookupError } = await userClient
      .from("resources")
      .select("file_path, downloadable, title")
      .eq("file_path", filePath)
      .maybeSingle();

    if (lookupError) {
      // Don't leak DB error details
      return jsonError(500, "Server error");
    }
    if (!resource) {
      return jsonError(404, "Not found");
    }

    // If you later want to require auth for downloads, uncomment:
    // const { data: claims } = await userClient.auth.getClaims(
    //   authHeader.replace("Bearer ", "")
    // );
    // if (!claims?.claims) return jsonError(401, "Unauthorized");

    // ---- 4. Fetch file from storage (service role bypasses bucket RLS safely,
    //         since we've already authorized via the resources table) ----
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: blob, error: dlError } = await adminClient.storage
      .from("study-materials")
      .download(resource.file_path);

    if (dlError || !blob) {
      return jsonError(404, "Not found");
    }

    // ---- 5. Stream back with anti-IDM / no-cache / inline headers ----
    const safeName =
      (resource.title || "document").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 100) +
      ".pdf";

    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      // Make it harder for the browser to be tricked into treating this as a download
      "X-Frame-Options": "SAMEORIGIN",
      // Expose downloadable flag to client (UI hint only — never trusted)
      "X-Resource-Downloadable": resource.downloadable ? "1" : "0",
    });

    return new Response(blob.stream(), { status: 200, headers });
  } catch {
    return jsonError(500, "Server error");
  }
});
