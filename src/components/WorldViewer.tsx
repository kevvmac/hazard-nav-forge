import { Loader2, Globe } from "lucide-react";

const WorldViewer = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
            3D Environment
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-ops-amber animate-pulse-amber" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Awaiting Data
          </span>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Scanline overlay */}
        <div className="absolute inset-0 ops-scanline pointer-events-none" />

        {/* Center content */}
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-primary/40 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 bg-primary/20 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Rendering Engine Standby
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/60">
              Submit mission parameters to initialize
            </span>
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-primary/20" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r border-t border-primary/20" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l border-b border-primary/20" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-primary/20" />
      </div>
    </div>
  );
};

export default WorldViewer;
