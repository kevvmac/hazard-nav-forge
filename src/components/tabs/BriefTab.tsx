import { Shield, Clock, Wrench, ArrowDownToLine, FileText } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

interface BriefTabProps {
  analysis: AnalysisResult | null;
  missionName: string;
}

const BriefTab = ({ analysis, missionName }: BriefTabProps) => {
  if (!analysis) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 h-full text-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          No brief generated — submit a mission input to generate
        </span>
      </div>
    );
  }

  const sections = [
    {
      icon: Shield,
      title: "Environment Summary",
      content: analysis.environment_summary,
      accent: "text-ops-red",
    },
    {
      icon: ArrowDownToLine,
      title: "Entry Recommendations",
      content: analysis.entry_recommendation,
    },
    {
      icon: Clock,
      title: "Time Constraints",
      content: analysis.time_constraint,
      accent: "text-ops-amber",
    },
    {
      icon: Wrench,
      title: "Equipment Required",
      content: analysis.equipment_required?.join(", ") || "None specified",
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="border border-border bg-secondary/50 px-3 py-2 flex items-center gap-2">
        <div className="h-2 w-2 bg-ops-amber" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
          Mission Summary — {missionName}
        </span>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${section.accent || "text-primary"}`} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-semibold">
                {section.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6 border-l border-border ml-2">
              {section.content}
            </p>
          </div>
        );
      })}

      <div className="border-t border-border pt-3 mt-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Brief generated • {new Date().toISOString().slice(0, 16).replace("T", " ")} UTC
        </span>
      </div>
    </div>
  );
};

export default BriefTab;
