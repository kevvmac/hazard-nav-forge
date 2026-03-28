import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WORLD_LABS_BASE = "https://api.worldlabs.ai/marble/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("WORLD_LABS_API_KEY");
    if (!apiKey) {
      throw new Error("WORLD_LABS_API_KEY is not configured");
    }

    const { action, environment_summary, operation_id } = await req.json();

    if (action === "generate") {
      if (!environment_summary) {
        return new Response(
          JSON.stringify({ error: "environment_summary is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${WORLD_LABS_BASE}/worlds:generate`, {
        method: "POST",
        headers: {
          "WLT-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: "Mission Brief World",
          model: "Marble 0.1-mini",
          world_prompt: {
            type: "text",
            text_prompt: environment_summary,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("World Labs generate error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: `World Labs API error: ${response.status}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "poll") {
      if (!operation_id) {
        return new Response(
          JSON.stringify({ error: "operation_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${WORLD_LABS_BASE}/operations/${operation_id}`, {
        headers: { "WLT-Api-Key": apiKey },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("World Labs poll error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: `World Labs poll error: ${response.status}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'generate' or 'poll'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-world error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
