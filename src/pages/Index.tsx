import { useState } from "react";
import TopBar from "@/components/TopBar";
import InputPanel from "@/components/InputPanel";
import WorldViewer from "@/components/WorldViewer";
import RightSidebar from "@/components/RightSidebar";
import type { AnalysisResult } from "@/types/analysis";

const Index = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [missionName, setMissionName] = useState("UNNAMED-OP");

  const handleAnalysisComplete = (result: AnalysisResult, name: string) => {
    setAnalysis(result);
    setMissionName(name);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <InputPanel onAnalysisComplete={handleAnalysisComplete} />
        <WorldViewer />
        <RightSidebar analysis={analysis} missionName={missionName} />
      </div>
    </div>
  );
};

export default Index;
