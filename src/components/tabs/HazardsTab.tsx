import { AlertTriangle, Flame, Zap, Skull, RadioTower } from "lucide-react";
import type { AnalysisResult, HazardData } from "@/types/analysis";

const severityConfig = {
  critical: { color: "text-ops-red", bg: "bg-ops-red/10", border: "border-ops-red/30", label: "CRIT" },
  high: { color: "text-ops-orange", bg: "bg-ops-orange/10", border: "border-ops-orange/30", label: "HIGH" },
  medium: { color: "text-ops-amber", bg: "bg-ops-amber/10", border: "border-ops-amber/30", label: "MED" },
};

const severityIcons: Record<string, React.ElementType> = {
  critical: Skull,
  high: Flame,
  medium: AlertTriangle,
};

interface HazardsTabProps {
  analysis: AnalysisResult | null;
}

const HazardsTab = ({ analysis }: HazardsTabProps) => {
  const hazards = analysis?.hazards || [];

  if (!analysis) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 h-full text-center">
        <RadioTower className="h-8 w-8 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Awaiting analysis — submit a mission input to scan for threats
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {hazards.length} threats identified
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-ops-red animate-pulse-amber" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-ops-red">Active</span>
        </div>
      </div>

      {hazards.map((hazard, i) => {
        const config = severityConfig[hazard.severity] || severityConfig.medium;
        const Icon = severityIcons[hazard.severity] || AlertTriangle;
        return (
          <div
            key={i}
            className={`border ${config.border} ${config.bg} p-3 flex flex-col gap-2`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                <span className="text-sm font-semibold text-foreground">{hazard.name}</span>
              </div>
              <span className={`font-mono text-[10px] font-bold ${config.color} px-1.5 py-0.5 border ${config.border} shrink-0`}>
                {config.label}
              </span>
            </div>
            {hazard.location && (
              <p className="text-[10px] font-mono text-muted-foreground pl-6 uppercase tracking-wider">
                Location: {hazard.location}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              {hazard.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default HazardsTab;
