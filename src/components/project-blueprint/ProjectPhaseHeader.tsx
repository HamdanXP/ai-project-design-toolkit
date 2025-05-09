
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ProjectPhase } from "@/types/project";

type ProjectPhaseHeaderProps = {
  isMobile: boolean;
  toggleSidebar: () => void;
  activePhaseId: string;
  phases: ProjectPhase[];
};

export const ProjectPhaseHeader = ({
  isMobile,
  toggleSidebar,
  activePhaseId,
  phases
}: ProjectPhaseHeaderProps) => {
  // Find the active phase to display its name
  const activePhase = phases.find(phase => phase.id === activePhaseId);
  
  return (
    <div className="flex items-center mb-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 p-1 h-7 w-7"
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {activePhase && (
        <h2 className="text-xl font-semibold">{activePhase.name} Phase</h2>
      )}
    </div>
  );
};
