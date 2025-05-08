
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ProjectPhase } from "@/types/project";

interface PhaseItemProps {
  phase: ProjectPhase;
  isActive: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onSelect: () => void;
  getStatusColor: (status: ProjectPhase["status"]) => string;
}

export const PhaseItem = ({ 
  phase, 
  isActive, 
  isOpen, 
  isMobile,
  onSelect, 
  getStatusColor 
}: PhaseItemProps) => {
  return (
    <div
      key={`${phase.id}-${phase.status}-${phase.progress}-${phase.completedSteps}`} // Force re-render when phase data changes
      className={cn(
        "mb-2 p-2 rounded-md cursor-pointer transition-all",
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-accent/50",
        phase.status === "completed" && "border-l-2 border-emerald-500"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center mb-2">
        <div
          className={cn(
            "h-3 w-3 rounded-full mr-2",
            getStatusColor(phase.status)
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            !isMobile && !isOpen ? "hidden" : "block"
          )}
        >
          {phase.name}
        </span>
      </div>
      {(isMobile || isOpen) && (
        <div className="pl-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{phase.completedSteps}/{phase.totalSteps}</span>
          </div>
          <Progress
            value={phase.progress}
            className="h-1.5"
          />
        </div>
      )}
    </div>
  );
};
