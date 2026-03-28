import TopBar from "@/components/TopBar";
import InputPanel from "@/components/InputPanel";
import WorldViewer from "@/components/WorldViewer";
import RightSidebar from "@/components/RightSidebar";

const Index = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <InputPanel />
        <WorldViewer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;
