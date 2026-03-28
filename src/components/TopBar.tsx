import { Radio, Shield } from "lucide-react";

const TopBar = () => {
  return (
    <div className="h-11 border-b border-border bg-ops-panel flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-mono text-sm uppercase tracking-widest text-primary font-bold">
          MissionBrief
        </span>
        <div className="h-4 w-px bg-border mx-1" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Tactical Environment Analysis
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 text-ops-green" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-ops-green">
          System Online
        </span>
      </div>
    </div>
  );
};

export default TopBar;
