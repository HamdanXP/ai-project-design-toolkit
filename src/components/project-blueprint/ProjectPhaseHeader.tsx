
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { ProjectPhase } from "@/types/project";
import { BackButton } from "@/components/BackButton";

type ProjectPhaseHeaderProps = {
  isMobile: boolean;
  toggleSidebar: () => void;
  toggleBtnRef?: React.RefObject<HTMLButtonElement>;
  activePhaseId: string;
  phases: ProjectPhase[];
  sidebarOpen: boolean;
};

export const ProjectPhaseHeader = ({
  isMobile,
  toggleSidebar,
  toggleBtnRef,
  activePhaseId,
  phases,
  sidebarOpen
}: ProjectPhaseHeaderProps) => {
  // Find the active phase to display its name
  const activePhase = phases.find(phase => phase.id === activePhaseId);
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <BackButton className="mr-2" />
        
        {/* Only show phase title in header on desktop or if mobile sidebar is closed */}
        {(!isMobile || !sidebarOpen) && activePhase && (
          <h2 className="text-xl font-semibold">{activePhase.name} Phase</h2>
        )}
      </div>
      
      {/* Always show mobile sidebar toggle on mobile */}
      {isMobile && (
        <Button
          ref={toggleBtnRef}
          variant="ghost"
          size="sm"
          className="ml-2 p-1 h-8 w-8"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
