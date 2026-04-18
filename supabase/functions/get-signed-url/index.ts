import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { file_path } = await req.json();

    if (!file_path || typeof file_path !== "string") {
      return new Response(
        JSON.stringify({ error: "file_path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify Auth & DB Flag
    // Create client with Authorization header to respect RLS
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader || "" } },
      }
    );

    // Ensure the resource exists and the user has access via RLS
    const { data: resource, error: dbError } = await supabaseClient
      .from("resources")
      .select("downloadable, title")
      .eq("file_path", file_path)
      .single();

    if (dbError || !resource) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access or file not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Generate signed URL
    // Use service role to generate signed URLs from the private bucket
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Apply the download option based on the flag
    const signedUrlOptions: any = {};
    if (resource.downloadable) {
      // Force attachment disposition with the safe title
      const safeTitle = resource.title.replace(/[^a-zA-Z0-9_-]/g, "_");
      signedUrlOptions.download = `${safeTitle}.pdf`;
    }

    // Generate a short-lived signed URL (60 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from("study-materials")
      .createSignedUrl(file_path, 3600, signedUrlOptions);

    if (error || !data) {
      console.error("Signed URL error:", error?.message);
      return new Response(
        JSON.stringify({ error: "Failed to generate URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: data.signedUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
