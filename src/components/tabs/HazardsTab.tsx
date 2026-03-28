import { AlertTriangle, Flame, Zap, Skull } from "lucide-react";

interface Hazard {
  id: string;
  name: string;
  severity: "critical" | "high" | "moderate" | "low";
  description: string;
  icon: React.ElementType;
}

const mockHazards: Hazard[] = [
  {
    id: "1",
    name: "Structural Collapse Risk",
    severity: "critical",
    description: "East wing supports compromised. Load-bearing walls show fracture patterns consistent with explosive damage.",
    icon: AlertTriangle,
  },
  {
    id: "2",
    name: "Chemical Contamination",
    severity: "high",
    description: "Residual chemical agents detected in lower levels. CBRN protocols required for entry.",
    icon: Skull,
  },
  {
    id: "3",
    name: "Electrical Hazard",
    severity: "moderate",
    description: "Exposed wiring in corridors B3-B7. Power grid status unknown. Assume live.",
    icon: Zap,
  },
  {
    id: "4",
    name: "Fire Risk",
    severity: "high",
    description: "Fuel storage on sublevel 2. Ventilation system may accelerate combustion.",
    icon: Flame,
  },
];

const severityConfig = {
  critical: { color: "text-ops-red", bg: "bg-ops-red/10", border: "border-ops-red/30", label: "CRIT" },
  high: { color: "text-ops-orange", bg: "bg-ops-orange/10", border: "border-ops-orange/30", label: "HIGH" },
  moderate: { color: "text-ops-amber", bg: "bg-ops-amber/10", border: "border-ops-amber/30", label: "MOD" },
  low: { color: "text-ops-green", bg: "bg-ops-green/10", border: "border-ops-green/30", label: "LOW" },
};

const HazardsTab = () => {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {mockHazards.length} threats identified
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-ops-red animate-pulse-amber" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-ops-red">Active</span>
        </div>
      </div>

      {mockHazards.map((hazard) => {
        const config = severityConfig[hazard.severity];
        const Icon = hazard.icon;
        return (
          <div
            key={hazard.id}
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
