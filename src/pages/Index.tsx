import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import InputPanel from "@/components/InputPanel";
import WorldViewer from "@/components/WorldViewer";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";

const extractWorldUrl = (payload: any): string | null => {
  if (typeof payload?.world_marble_url === "string" && payload.world_marble_url.length > 0) {
    return payload.world_marble_url;
  }
  if (typeof payload?.response?.world_marble_url === "string" && payload.response.world_marble_url.length > 0) {
    return payload.response.world_marble_url;
  }
  return null;
};

const extractThumbnailUrl = (payload: any): string | null => {
  if (typeof payload?.thumbnail_url === "string" && payload.thumbnail_url.length > 0) {
    return payload.thumbnail_url;
  }
  if (typeof payload?.response?.assets?.thumbnail_url === "string" && payload.response.assets.thumbnail_url.length > 0) {
    return payload.response.assets.thumbnail_url;
  }
  return null;
};

const Index = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [missionName, setMissionName] = useState("UNNAMED-OP");
  const [worldUrl, setWorldUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(false);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageMediaType, setUploadedImageMediaType] = useState<string>("image/jpeg");
  const { toast } = useToast();

  const generateWorld = useCallback(async (environmentSummary: string, imageBase64?: string | null, mediaType?: string) => {
    setIsGeneratingWorld(true);
    setWorldUrl(null);
    setThumbnailUrl(null);

    try {
      // Determine action based on whether we have an image
      const body = imageBase64
        ? {
            action: "generate_with_image",
            environment_summary: environmentSummary,
            image_base64: imageBase64,
            media_type: mediaType || "image/jpeg",
          }
        : {
            action: "generate",
            environment_summary: environmentSummary,
          };

      const { data: genData, error: genError } = await supabase.functions.invoke("generate-world", {
        body,
      });

      if (genError) throw genError;
      if (genData?.error) throw new Error(genData.error);

      const operationId = genData?.operation_id;
      if (!operationId) throw new Error("No operation_id returned from World Labs");
      console.log("World generation operation created:", operationId, genData);

      // Poll until done
      const poll = async (): Promise<string> => {
        const { data: pollData, error: pollError } = await supabase.functions.invoke("generate-world", {
          body: { action: "poll", operation_id: operationId },
        });

        if (pollError) throw pollError;
        if (pollData?.error) throw new Error(pollData.error);
        console.log("World generation poll response:", pollData);

        if (pollData?.done) {
          const resolvedWorldUrl = extractWorldUrl(pollData);
          const resolvedThumbnailUrl = extractThumbnailUrl(pollData);

          if (!resolvedWorldUrl) {
            throw new Error("World generation completed but no world URL was returned");
          }

          console.log("Setting world URL:", resolvedWorldUrl);
          console.log("Setting thumbnail URL:", resolvedThumbnailUrl);
          return { worldUrl: resolvedWorldUrl, thumbnailUrl: resolvedThumbnailUrl };
        }

        // Wait 5 seconds then poll again
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return poll();
      };

      const result = await poll();
      setWorldUrl(result.worldUrl);
      setThumbnailUrl(result.thumbnailUrl);
      toast({ title: "3D World Ready", description: "Environment has been generated successfully." });
    } catch (err: any) {
      console.error("World generation failed:", err);
      toast({ title: "World generation failed", description: err.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsGeneratingWorld(false);
    }
  }, [toast]);

  const handleAnalysisComplete = (result: AnalysisResult, name: string, imageBase64?: string | null, mediaType?: string) => {
    setAnalysis(result);
    setMissionName(name);
    if (imageBase64) {
      setUploadedImageBase64(imageBase64);
      setUploadedImageMediaType(mediaType || "image/jpeg");
    } else {
      setUploadedImageBase64(null);
    }

    // Kick off world generation with the environment summary
    if (result.environment_summary) {
      generateWorld(result.environment_summary, imageBase64, mediaType);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <InputPanel onAnalysisComplete={handleAnalysisComplete} />
        <WorldViewer worldUrl={worldUrl} isGenerating={isGeneratingWorld} />
        <RightSidebar analysis={analysis} missionName={missionName} />
      </div>
    </div>
  );
};

export default Index;
