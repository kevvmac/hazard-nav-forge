import { useState } from "react";
import { Upload, FileText, Crosshair, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";

interface InputPanelProps {
  onAnalysisComplete: (result: AnalysisResult, missionName: string) => void;
}

const InputPanel = ({ onAnalysisComplete }: InputPanelProps) => {
  const [missionName, setMissionName] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMediaType, setFileMediaType] = useState<string>("image/jpeg");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileMediaType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const body: Record<string, string> = {};

      if (fileBase64) {
        body.image_base64 = fileBase64;
        body.media_type = fileMediaType;
        if (description) {
          body.text = description;
        }
      } else {
        body.text = description;
      }

      const { data, error } = await supabase.functions.invoke("analyze-environment", {
        body,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      onAnalysisComplete(data as AnalysisResult, missionName || "UNNAMED-OP");
      toast({ title: "Analysis complete", description: `${data.hazards?.length || 0} hazards identified.` });
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast({ title: "Analysis failed", description: err.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = !isLoading && (!!description || !!fileBase64);

  return (
    <div className="w-80 min-w-[320px] border-r border-border bg-ops-panel flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-primary" />
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
          Mission Input
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Mission Designation
          </label>
          <input
            type="text"
            value={missionName}
            onChange={(e) => setMissionName(e.target.value)}
            placeholder="OP-NIGHTFALL-7"
            className="bg-input border border-border px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Environment Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the target environment: terrain, structures, known threats, weather conditions..."
            rows={8}
            className="bg-input border border-border px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <label className="border border-dashed border-border hover:border-primary/50 bg-input/50 cursor-pointer flex flex-col items-center justify-center gap-2 py-6 transition-colors group">
          <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
            {fileName || "Upload recon image"}
          </span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {fileName && (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary px-3 py-2">
            <FileText className="h-3 w-3" />
            <span className="truncate">{fileName}</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full py-2.5 font-mono text-xs uppercase tracking-widest font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all ops-glow-amber flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Generate Brief"
          )}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
