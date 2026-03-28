import { Shield, Clock, Wrench, ArrowDownToLine } from "lucide-react";

interface BriefSection {
  icon: React.ElementType;
  title: string;
  content: string;
  accent?: string;
}

const sections: BriefSection[] = [
  {
    icon: Shield,
    title: "Threat Level",
    content: "ELEVATED — Multiple structural and chemical hazards confirmed. Hostile presence unconfirmed but assumed. Rules of engagement: defensive posture until verified.",
    accent: "text-ops-red",
  },
  {
    icon: ArrowDownToLine,
    title: "Entry Recommendations",
    content: "Primary: North service entrance (Grid Ref: NQ-447). Secondary: Rooftop via east fire escape. Avoid main atrium — structural integrity below threshold. Two-team leapfrog formation advised.",
  },
  {
    icon: Clock,
    title: "Time Constraints",
    content: "Window of operation: 0200–0430 local. Chemical agent half-life estimated at 6 hours from last detection. Structure rated for 48h before critical failure probability exceeds 40%.",
    accent: "text-ops-amber",
  },
  {
    icon: Wrench,
    title: "Equipment",
    content: "CBRN masks (full-face), structural shoring kit, thermal imaging, comms relay (building interior dead zones expected). Recommend breaching charges for sealed sublevel doors.",
  },
];

const BriefTab = () => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="border border-border bg-secondary/50 px-3 py-2 flex items-center gap-2">
        <div className="h-2 w-2 bg-ops-amber" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
          Mission Summary — OP-NIGHTFALL-7
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
