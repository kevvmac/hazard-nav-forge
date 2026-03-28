import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a hazard analysis AI for high-risk environment briefings. When given a description of a dangerous environment, respond only in JSON with this structure: { "environment_summary": "2-3 sentence description of the space", "hazards": [ { "name": "hazard name", "severity": "critical/high/medium", "location": "where in the space", "description": "what the risk is" } ], "entry_recommendation": "recommended approach", "time_constraint": "safe exposure window if applicable", "equipment_required": ["item1", "item2"] } Return only JSON, no markdown, no explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { text, image_base64, media_type } = await req.json();

    if (!text && !image_base64) {
      return new Response(
        JSON.stringify({ error: "Either text or image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build content blocks
    const content: any[] = [];

    if (image_base64) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: media_type || "image/jpeg",
          data: image_base64,
        },
      });
      content.push({
        type: "text",
        text: text || "Analyze this environment and identify all hazards.",
      });
    } else {
      content.push({ type: "text", text });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const resultText = data.content?.[0]?.text || "";

    // Parse the JSON from Claude's response
    let analysis;
    try {
      analysis = JSON.parse(resultText);
    } catch {
      // Try extracting JSON from potential markdown wrapping
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse Claude response as JSON");
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-environment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
