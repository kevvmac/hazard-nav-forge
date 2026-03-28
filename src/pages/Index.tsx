import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import InputPanel from "@/components/InputPanel";
import WorldViewer from "@/components/WorldViewer";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [missionName, setMissionName] = useState("UNNAMED-OP");
  const [worldUrl, setWorldUrl] = useState<string | null>(null);
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(false);
  const { toast } = useToast();

  const generateWorld = useCallback(async (environmentSummary: string) => {
    setIsGeneratingWorld(true);
    setWorldUrl(null);

    try {
      // Start generation
      const { data: genData, error: genError } = await supabase.functions.invoke("generate-world", {
        body: { action: "generate", environment_summary: environmentSummary },
      });

      if (genError) throw genError;
      if (genData?.error) throw new Error(genData.error);

      const operationId = genData?.operation_id;
      if (!operationId) throw new Error("No operation_id returned from World Labs");

      // Poll until done
      const poll = async (): Promise<string> => {
        const { data: pollData, error: pollError } = await supabase.functions.invoke("generate-world", {
          body: { action: "poll", operation_id: operationId },
        });

        if (pollError) throw pollError;
        if (pollData?.error) throw new Error(pollData.error);

        if (pollData?.done) {
          return pollData.world_marble_url;
        }

        // Wait 5 seconds then poll again
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return poll();
      };

      const url = await poll();
      setWorldUrl(url);
      toast({ title: "3D World Ready", description: "Environment has been generated successfully." });
    } catch (err: any) {
      console.error("World generation failed:", err);
      toast({ title: "World generation failed", description: err.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsGeneratingWorld(false);
    }
  }, [toast]);

  const handleAnalysisComplete = (result: AnalysisResult, name: string) => {
    setAnalysis(result);
    setMissionName(name);

    // Kick off world generation with the environment summary
    if (result.environment_summary) {
      generateWorld(result.environment_summary);
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
