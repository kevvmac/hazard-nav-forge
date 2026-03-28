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
    if (!apiKey) throw new Error("WORLD_LABS_API_KEY is not configured");

    const wlHeaders = {
      "WLT-Api-Key": apiKey,
      "Content-Type": "application/json",
    };

    const body = await req.json();
    const { action } = body;

    // --- ACTION: generate (text-only, Scenario A) ---
    if (action === "generate") {
      const { environment_summary } = body;
      if (!environment_summary) {
        return new Response(
          JSON.stringify({ error: "environment_summary is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${WORLD_LABS_BASE}/worlds:generate`, {
        method: "POST",
        headers: wlHeaders,
        body: JSON.stringify({
          display_name: "Mission Brief",
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
          JSON.stringify({ error: `World Labs API error: ${response.status}`, details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log("World Labs generate response:", JSON.stringify(data));
      console.log("World Labs operation created:", data?.operation_id);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- ACTION: generate_with_image (Scenario B — 3 steps) ---
    if (action === "generate_with_image") {
      const { environment_summary, image_base64, media_type } = body;
      if (!image_base64) {
        return new Response(
          JSON.stringify({ error: "image_base64 is required for generate_with_image" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine extension from media_type
      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const ext = extensionMap[media_type || "image/jpeg"] || "jpg";
      const contentType = media_type || "image/jpeg";

      // Step B1: Prepare upload
      const prepareRes = await fetch(`${WORLD_LABS_BASE}/media-assets:prepare_upload`, {
        method: "POST",
        headers: wlHeaders,
        body: JSON.stringify({
          file_name: `recon.${ext}`,
          kind: "image",
          extension: ext,
        }),
      });

      if (!prepareRes.ok) {
        const errorText = await prepareRes.text();
        console.error("World Labs prepare_upload error:", prepareRes.status, errorText);
        return new Response(
          JSON.stringify({ error: `Prepare upload failed: ${prepareRes.status}`, details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const prepareData = await prepareRes.json();
      console.log("prepare_upload response:", JSON.stringify(prepareData));
      const mediaAssetId = prepareData?.media_asset?.media_asset_id;
      const uploadUrl = prepareData?.upload_info?.upload_url;

      if (!mediaAssetId || !uploadUrl) {
        console.error("Unexpected prepare_upload response:", JSON.stringify(prepareData));
        return new Response(
          JSON.stringify({ error: "Missing media_asset.media_asset_id or upload_info.upload_url from prepare_upload" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step B2: Upload the image binary
      // Decode base64 to binary
      const binaryStr = atob(image_base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "x-goog-content-length-range": "0,104857600",
          "host": "storage.googleapis.com",
        },
        body: bytes,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Image upload error:", uploadRes.status, errorText);
        return new Response(
          JSON.stringify({ error: `Image upload failed: ${uploadRes.status}`, details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step B3: Generate world with image
      const generateBody: Record<string, unknown> = {
        display_name: "Mission Brief",
        model: "Marble 0.1-mini",
        world_prompt: {
          type: "image",
          image_prompt: {
            source: "media_asset",
            media_asset_id: mediaAssetId,
          },
          ...(environment_summary ? { text_prompt: environment_summary } : {}),
        },
      };

      const genRes = await fetch(`${WORLD_LABS_BASE}/worlds:generate`, {
        method: "POST",
        headers: wlHeaders,
        body: JSON.stringify(generateBody),
      });

      if (!genRes.ok) {
        const errorText = await genRes.text();
        console.error("World Labs generate (image) error:", genRes.status, errorText);
        return new Response(
          JSON.stringify({ error: `World Labs generate error: ${genRes.status}`, details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const genData = await genRes.json();
      console.log("World Labs image generate response:", JSON.stringify(genData));
      console.log("World Labs operation created:", genData?.operation_id);
      return new Response(JSON.stringify(genData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- ACTION: poll ---
    if (action === "poll") {
      const { operation_id } = body;
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
          JSON.stringify({ error: `World Labs poll error: ${response.status}`, details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log("World Labs poll response:", JSON.stringify(data));

      const worldMarbleUrl = data?.response?.world_marble_url ?? null;
      if (data?.done) {
        console.log("World Labs completed world URL:", worldMarbleUrl);
      }

      return new Response(JSON.stringify({
        ...data,
        world_marble_url: worldMarbleUrl,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'generate', 'generate_with_image', or 'poll'." }),
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
