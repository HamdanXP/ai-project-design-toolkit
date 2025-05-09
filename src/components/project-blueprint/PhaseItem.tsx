
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ProjectPhase } from "@/types/project";
import { useEffect, useState } from "react";

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
  // Create a state that tracks the rendered phase to ensure UI updates
  const [renderedPhase, setRenderedPhase] = useState(phase);
  
  // Update the rendered phase when the phase prop changes
  useEffect(() => {
    setRenderedPhase(phase);
    console.log(`PhaseItem updated: ${phase.id}, status: ${phase.status}, progress: ${phase.progress}`);
  }, [phase]);
  
  // Determine if the phase is completed
  const isCompleted = renderedPhase.status === "completed";
  
  return (
    <div
      className={cn(
        "mb-2 p-2 rounded-md cursor-pointer transition-all",
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-accent/50",
        isCompleted ? "border-l-2 border-emerald-500" : ""
      )}
      onClick={onSelect}
    >
      <div className="flex items-center mb-2">
        <div
          className={cn(
            "h-3 w-3 rounded-full mr-2",
            getStatusColor(renderedPhase.status)
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            !isMobile && !isOpen ? "hidden" : "block",
            isCompleted ? "text-emerald-600" : ""
          )}
        >
          {renderedPhase.name}
          {isCompleted && " ✓"}
        </span>
      </div>
      {(isMobile || isOpen) && (
        <div className="pl-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{renderedPhase.completedSteps}/{renderedPhase.totalSteps}</span>
          </div>
          <Progress
            value={renderedPhase.progress}
            className={cn(
              "h-1.5",
              isCompleted ? "bg-emerald-100" : ""
            )}
            indicatorClassName={isCompleted ? "bg-emerald-500" : undefined}
          />
        </div>
      )}
    </div>
  );
};
