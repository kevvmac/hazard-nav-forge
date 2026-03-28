import { useState } from "react";
import HazardsTab from "./tabs/HazardsTab";
import BriefTab from "./tabs/BriefTab";
import ChatTab from "./tabs/ChatTab";

const tabs = [
  { id: "hazards", label: "Hazards" },
  { id: "brief", label: "Brief" },
  { id: "chat", label: "Chat" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState<TabId>("hazards");

  return (
    <div className="w-96 min-w-[384px] border-l border-border bg-ops-panel flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "hazards" && <HazardsTab />}
        {activeTab === "brief" && <BriefTab />}
        {activeTab === "chat" && <ChatTab />}
      </div>
    </div>
  );
};

export default RightSidebar;
